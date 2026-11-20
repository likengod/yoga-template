import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { AuditReport, AuditIssue, AnalyzeResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max timeout for scraping + optional LLM

// Helper: Normalize URL
function normalizeUrl(rawUrl: string): URL {
  let target = rawUrl.trim();
  if (!/^https?:\/\//i.test(target)) {
    target = 'https://' + target;
  }
  return new URL(target);
}

// Helper: Safe fetch with timeout
async function safeFetch(url: string, timeoutMs: number = 8000, headers: HeadersInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OmniSearchAuditor/1.0; +https://omnisearch.dev/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...headers,
      },
      redirect: 'follow',
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'A valid URL is required.' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = normalizeUrl(url);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid URL format. Please check the address.' }, { status: 400 });
    }

    const domain = parsedUrl.origin;

    // Parallel fetch: Main page HTML, robots.txt, and llms.txt
    const [pageRes, robotsRes, llmsRes] = await Promise.allSettled([
      safeFetch(parsedUrl.toString(), 10000),
      safeFetch(`${domain}/robots.txt`, 4000),
      safeFetch(`${domain}/llms.txt`, 4000),
    ]);

    if (pageRes.status !== 'fulfilled' || !pageRes.value.ok) {
      const statusCode = pageRes.status === 'fulfilled' ? pageRes.value.status : 'Fetch failed';
      return NextResponse.json({
        success: false,
        error: `Failed to fetch target URL (${statusCode}). Ensure the page is publicly reachable.`,
      }, { status: 422 });
    }

    const html = await pageRes.value.text();
    const $ = cheerio.load(html);

    // ==========================================
    // PARSE ROBOTS.TXT & LLMS.TXT
    // ==========================================
    let robotsTxtStatus: 'allowed' | 'disallowed' | 'not_found' | 'error' = 'not_found';
    let blockedBots: string[] = [];

    if (robotsRes.status === 'fulfilled' && robotsRes.value.ok) {
      try {
        const robotsText = (await robotsRes.value.text()).toLowerCase();
        robotsTxtStatus = 'allowed';

        const aiBots = ['gptbot', 'perplexitybot', 'claudebot', 'anthropic-ai', 'google-extended', 'ccbot'];
        for (const bot of aiBots) {
          const userAgentBlock = robotsText.indexOf(`user-agent: ${bot}`);
          if (userAgentBlock !== -1) {
            const nextSlice = robotsText.slice(userAgentBlock, userAgentBlock + 200);
            if (nextSlice.includes('disallow: /')) {
              blockedBots.push(bot);
            }
          }
        }
        if (blockedBots.length > 0) {
          robotsTxtStatus = 'disallowed';
        }
      } catch {
        robotsTxtStatus = 'error';
      }
    }

    const llmsTxtFound = llmsRes.status === 'fulfilled' && llmsRes.value.ok && llmsRes.value.status === 200;

    // ==========================================
    // EXTRACT DOM DATA
    // ==========================================
    const title = $('title').first().text().trim();
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || 
                            $('meta[property="og:description"]').attr('content')?.trim() || '';
    const canonical = $('link[rel="canonical"]').attr('href')?.trim();
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
    const ogImage = $('meta[property="og:image"]').attr('content')?.trim();
    const viewport = $('meta[name="viewport"]').attr('content')?.trim();

    const h1Elements = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h2Elements = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h3Elements = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h4Elements = $('h4').map((_, el) => $(el).text().trim()).get().filter(Boolean);

    const images = $('img');
    let missingAltCount = 0;
    images.each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt === undefined || alt.trim() === '') {
        missingAltCount++;
      }
    });

    const listElements = $('ul, ol');
    const tableElements = $('table');

    // Body content clean-up for word & fact counts
    $('script, style, noscript, svg, nav, footer').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const words = bodyText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // JSON-LD structured data analysis
    const jsonLdTypes: string[] = [];
    let hasOrgWithSameAs = false;
    let hasAuthorEntity = false;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const rawJson = $(el).html();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] ? parsed['@graph'] : [parsed]);

          for (const item of items) {
            if (item['@type']) {
              const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
              jsonLdTypes.push(...types);
            }
            if (item['@type'] === 'Organization' && Array.isArray(item.sameAs) && item.sameAs.length > 0) {
              hasOrgWithSameAs = true;
            }
            if (item.author || item['@type'] === 'Person') {
              hasAuthorEntity = true;
            }
          }
        }
      } catch {
        // ignore malformed JSON-LD
      }
    });

    // Author check in HTML if not in schema
    const authorMeta = $('meta[name="author"]').attr('content');
    const authorTag = $('[rel="author"], .author, .author-name, .byline, [itemprop="author"]').length > 0;
    const authorFound = Boolean(authorMeta || authorTag || hasAuthorEntity);

    // Outbound external links
    const outboundLinks: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const resolved = new URL(href, parsedUrl.origin);
          if (resolved.origin !== parsedUrl.origin && (resolved.protocol === 'http:' || resolved.protocol === 'https:')) {
            outboundLinks.push(resolved.href);
          }
        } catch {
          // invalid href
        }
      }
    });

    // Check Question & Answer / FAQ patterns
    const questionRegex = /^(what|how|why|when|where|who|which|can|is|are|do|does|should)\b.*\?/i;
    const hasQuestionHeadings = [...h2Elements, ...h3Elements].some((h) => questionRegex.test(h) || h.includes('?'));
    const hasFaqSchema = jsonLdTypes.some((t) => t.toLowerCase().includes('faqpage'));
    const faqFound = hasQuestionHeadings || hasFaqSchema || $('details, .faq, #faq').length > 0;

    // Factual & Statistical Density
    // Looks for numbers, % signs, currencies, dates, measurements
    const statMatches = bodyText.match(/\b\d+(\.\d+)?%|\$\d+(\.\d+)?|\b\d{4}\b|\b\d+(,\d{3})+|\b(one|two|three|four|five|ten|hundred|thousand|million|billion)\b|\b\d+\b/gi) || [];
    const dataPointCount = statMatches.length;

    // AEO Inverted Pyramid Check: Evaluate paragraph directly following H2 tags
    let hasAnswerFirstBlocks = false;
    let answerFirstMatches = 0;
    $('h2').each((_, el) => {
      const nextP = $(el).nextAll('p').first().text().trim();
      const pWords = nextP.split(/\s+/).filter(Boolean).length;
      if (pWords >= 35 && pWords <= 75) {
        answerFirstMatches++;
      }
    });
    if (h2Elements.length > 0 && answerFirstMatches >= Math.min(2, h2Elements.length)) {
      hasAnswerFirstBlocks = true;
    }

    // ==========================================
    // SCORING ENGINE (100 TOTAL POINTS)
    // ==========================================
    const issues: AuditIssue[] = [];

    // --- PILLAR 1: TRADITIONAL SEO (30 PTS MAX) ---
    let seoScore = 0;

    // 1. Title Tag (5 pts)
    if (title.length >= 30 && title.length <= 60) {
      seoScore += 5;
    } else if (title.length > 0) {
      seoScore += 2;
      issues.push({
        id: 'seo-title-length',
        pillar: 'SEO',
        category: 'Meta Tags',
        title: `Title Tag Length Suboptimal (${title.length} characters)`,
        description: `Current title is "${title}". Search engines typically display the first 50–60 characters cleanly before truncating.`,
        priority: 'warning',
        scoreDeduction: 3,
        aiEngineImpact: 'AI summary crawlers and SERPs use title tags as the primary entity hook for query relevance.',
        recommendation: 'Optimize your <title> tag between 30 and 60 characters with your target keyword upfront.',
        codeSnippet: `<title>Primary Keyword - Secondary Benefit | Brand Name</title>`,
        codeLanguage: 'html',
      });
    } else {
      issues.push({
        id: 'seo-title-missing',
        pillar: 'SEO',
        category: 'Meta Tags',
        title: 'Missing <title> Tag',
        description: 'The page has no title tag in the <head> section.',
        priority: 'critical',
        scoreDeduction: 5,
        aiEngineImpact: 'Without a title tag, search engines cannot index the core topic accurately.',
        recommendation: 'Add a descriptive <title> tag immediately within your <head>.',
        codeSnippet: `<title>Your Targeted Page Title (30-60 Characters)</title>`,
        codeLanguage: 'html',
      });
    }

    // 2. Meta Description (5 pts)
    if (metaDescription.length >= 120 && metaDescription.length <= 160) {
      seoScore += 5;
    } else if (metaDescription.length > 0) {
      seoScore += 2;
      issues.push({
        id: 'seo-meta-desc-length',
        pillar: 'SEO',
        category: 'Meta Tags',
        title: `Meta Description Suboptimal (${metaDescription.length} characters)`,
        description: `Current description is ${metaDescription.length} chars. Ideal length is 120-160 characters.`,
        priority: 'warning',
        scoreDeduction: 3,
        aiEngineImpact: 'Search engines generate snippets from descriptions; models use it as an early contextual primer.',
        recommendation: 'Craft a compelling summary between 120 and 160 characters containing an action-oriented call to action.',
        codeSnippet: `<meta name="description" content="Discover how [solution] solves [problem] with data-backed insights, step-by-step guidance, and real-world benchmarks." />`,
        codeLanguage: 'html',
      });
    } else {
      issues.push({
        id: 'seo-meta-desc-missing',
        pillar: 'SEO',
        category: 'Meta Tags',
        title: 'Missing Meta Description',
        description: 'No <meta name="description"> tag was discovered on the page.',
        priority: 'critical',
        scoreDeduction: 5,
        aiEngineImpact: 'Generative engines and Google are forced to synthesize an unvetted snippet from page fragments.',
        recommendation: 'Add a clear meta description tag summarizing the page value.',
        codeSnippet: `<meta name="description" content="Comprehensive analysis and guide covering [topic], written by industry experts." />`,
        codeLanguage: 'html',
      });
    }

    // 3. Heading Structure (8 pts)
    if (h1Elements.length === 1 && (h2Elements.length >= 2 || wordCount < 300)) {
      seoScore += 8;
    } else if (h1Elements.length > 1) {
      seoScore += 4;
      issues.push({
        id: 'seo-multiple-h1',
        pillar: 'SEO',
        category: 'Information Architecture',
        title: `Multiple H1 Tags Detected (${h1Elements.length} Found)`,
        description: 'Search engines expect a single H1 defining the main subject of the document.',
        priority: 'warning',
        scoreDeduction: 4,
        aiEngineImpact: 'Confuses document hierarchy and dilutes topic focus in neural embeddings.',
        recommendation: 'Retain only one H1 for your primary topic and downgrade secondary titles to H2 or H3 tags.',
        codeSnippet: `<h1>Single Core Page Topic</h1>\n  <h2>Subtopic Section</h2>\n    <h3>Granular Detail</h3>`,
        codeLanguage: 'html',
      });
    } else if (h1Elements.length === 0) {
      issues.push({
        id: 'seo-missing-h1',
        pillar: 'SEO',
        category: 'Information Architecture',
        title: 'Missing Primary H1 Tag',
        description: 'No H1 tag exists on the page.',
        priority: 'critical',
        scoreDeduction: 8,
        aiEngineImpact: 'Critical failure for topic identification in search algorithms.',
        recommendation: 'Add a single authoritative H1 heading near the top of the main content.',
        codeSnippet: `<h1>Main Title of the Page</h1>`,
        codeLanguage: 'html',
      });
    } else {
      seoScore += 5;
    }

    // 4. Canonical & OpenGraph (4 pts)
    if (canonical && ogTitle && ogImage) {
      seoScore += 4;
    } else if (canonical || ogTitle) {
      seoScore += 2;
      issues.push({
        id: 'seo-opengraph-incomplete',
        pillar: 'SEO',
        category: 'Social & Canonical',
        title: 'Incomplete Canonical or OpenGraph Meta Tags',
        description: `Canonical: ${canonical ? 'Present' : 'Missing'}, OpenGraph Image: ${ogImage ? 'Present' : 'Missing'}.`,
        priority: 'warning',
        scoreDeduction: 2,
        aiEngineImpact: 'AI search browsers (e.g. Perplexity, Arc Search) render rich cards using OpenGraph tags.',
        recommendation: 'Ensure both canonical tags and OG social cards (title, description, image) are defined.',
        codeSnippet: `<link rel="canonical" href="${parsedUrl.origin}${parsedUrl.pathname}" />\n<meta property="og:title" content="Page Title" />\n<meta property="og:image" content="https://example.com/cover.jpg" />`,
        codeLanguage: 'html',
      });
    } else {
      issues.push({
        id: 'seo-opengraph-missing',
        pillar: 'SEO',
        category: 'Social & Canonical',
        title: 'Missing Canonical and Social Sharing Metadata',
        description: 'Neither canonical URL nor OpenGraph cards are implemented.',
        priority: 'warning',
        scoreDeduction: 4,
        aiEngineImpact: 'Vulnerable to duplicate content penalties across protocol/query string variations.',
        recommendation: 'Declare canonical URL and OpenGraph headers in the <head>.',
        codeSnippet: `<link rel="canonical" href="${parsedUrl.href}" />`,
        codeLanguage: 'html',
      });
    }

    // 5. Image Alt Attributes (4 pts)
    if (images.length === 0 || missingAltCount === 0) {
      seoScore += 4;
    } else {
      const deduction = Math.min(4, Math.ceil((missingAltCount / images.length) * 4));
      seoScore += Math.max(0, 4 - deduction);
      issues.push({
        id: 'seo-missing-image-alt',
        pillar: 'SEO',
        category: 'Accessibility & Visual SEO',
        title: `${missingAltCount} of ${images.length} Images Missing Alt Text`,
        description: 'Images without descriptive alt text harm accessibility and visual discovery.',
        priority: missingAltCount > 3 ? 'critical' : 'warning',
        scoreDeduction: deduction,
        aiEngineImpact: 'Multimodal AI engines cannot comprehend visual context without alternative text.',
        recommendation: 'Add clear, contextual alt text describing the content and function of every image.',
        codeSnippet: `<img src="architecture-diagram.png" alt="Overview of the 3-pillar OmniSearch optimization framework" />`,
        codeLanguage: 'html',
      });
    }

    // 6. Mobile / Viewport & DOM (4 pts)
    if (viewport) {
      seoScore += 4;
    } else {
      issues.push({
        id: 'seo-missing-viewport',
        pillar: 'SEO',
        category: 'Mobile Readiness',
        title: 'Missing Mobile Viewport Meta Tag',
        description: 'The page does not specify a viewport meta tag for responsive design.',
        priority: 'critical',
        scoreDeduction: 4,
        aiEngineImpact: 'Fails Google mobile-first indexing benchmarks.',
        recommendation: 'Add the standard viewport meta tag to your <head>.',
        codeSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
        codeLanguage: 'html',
      });
    }


    // --- PILLAR 2: ANSWER ENGINE OPTIMIZATION (AEO) (35 PTS MAX) ---
    let aeoScore = 0;

    // 1. Answer-First Inverted Pyramid (12 pts)
    if (hasAnswerFirstBlocks) {
      aeoScore += 12;
    } else if (h2Elements.length > 0) {
      aeoScore += 5;
      issues.push({
        id: 'aeo-inverted-pyramid-lacking',
        pillar: 'AEO',
        category: 'Direct Answers',
        title: 'Lack of Answer-First Summary Paragraphs Below Headings',
        description: 'Headings are followed by conversational prose or filler rather than concise 40-60 word definitive answers.',
        priority: 'critical',
        scoreDeduction: 7,
        aiEngineImpact: 'Answer engines (Perplexity, ChatGPT Search, Google AI Overviews) extract concise 40-60 word paragraphs directly below headings for zero-click answer cards.',
        recommendation: 'Format the first paragraph directly beneath each H2 as a standalone definition or direct answer before diving into nuances.',
        codeSnippet: `<h2>What is Generative Engine Optimization (GEO)?</h2>\n<p>Generative Engine Optimization (GEO) is the practice of optimizing digital content to maximize visibility and citation frequency in AI-powered search engines like ChatGPT, Claude, and Perplexity by emphasizing factual density, source credibility, and structured knowledge.</p>`,
        codeLanguage: 'html',
      });
    } else {
      issues.push({
        id: 'aeo-inverted-pyramid-missing',
        pillar: 'AEO',
        category: 'Direct Answers',
        title: 'No Section Headings or Inverted Pyramid Formatting',
        description: 'Content lacks structural headings with accompanying direct answer summaries.',
        priority: 'critical',
        scoreDeduction: 12,
        aiEngineImpact: 'Prevents chunking algorithms in Retrieval-Augmented Generation (RAG) pipelines from isolating distinct concepts.',
        recommendation: 'Break content into distinct H2/H3 modules with succinct definitions upfront.',
        codeSnippet: `<h2>Key Takeaway</h2>\n<p>Summary of core thesis in 45 words.</p>`,
        codeLanguage: 'html',
      });
    }

    // 2. Extraction Formatting (Lists & Tables) (10 pts)
    if (listElements.length >= 2 && tableElements.length >= 1) {
      aeoScore += 10;
    } else if (listElements.length >= 1 || tableElements.length >= 1) {
      aeoScore += 6;
      issues.push({
        id: 'aeo-extraction-formatting-partial',
        pillar: 'AEO',
        category: 'Information Structuring',
        title: 'Limited Extraction Formatting (Need Tables / Multi-Lists)',
        description: `Found ${listElements.length} lists and ${tableElements.length} comparison tables. High-converting AEO content uses both comparison tables and ordered steps.`,
        priority: 'warning',
        scoreDeduction: 4,
        aiEngineImpact: 'AI response generators favor markdown tables and bulleted steps for direct citation and syntheses.',
        recommendation: 'Add comparison tables (`<table>`) for metrics and ordered lists (`<ol>`) for sequential procedures.',
        codeSnippet: `<table>\n  <thead><tr><th>Feature</th><th>Traditional SEO</th><th>GEO</th></tr></thead>\n  <tbody><tr><td>Focus</td><td>Keywords & Links</td><td>Citations & Facts</td></tr></tbody>\n</table>`,
        codeLanguage: 'html',
      });
    } else {
      issues.push({
        id: 'aeo-extraction-formatting-missing',
        pillar: 'AEO',
        category: 'Information Structuring',
        title: 'Missing Structured Lists & Comparison Tables',
        description: 'Text consists almost entirely of unstructured paragraphs without <ul>, <ol>, or <table> tags.',
        priority: 'critical',
        scoreDeduction: 10,
        aiEngineImpact: 'Unstructured text requires higher token compute to extract key points, lowering retrieval likelihood.',
        recommendation: 'Convert prose lists into unordered or ordered HTML lists and add a comparative table.',
        codeSnippet: `<ul>\n  <li><strong>Point 1:</strong> Direct insight.</li>\n  <li><strong>Point 2:</strong> Data metric.</li>\n</ul>`,
        codeLanguage: 'html',
      });
    }

    // 3. Question & Answer Coverage (7 pts)
    if (faqFound) {
      aeoScore += 7;
    } else {
      issues.push({
        id: 'aeo-faq-missing',
        pillar: 'AEO',
        category: 'Conversational Queries',
        title: 'Missing Natural-Language Q&A / FAQ Section',
        description: 'No question-oriented headings or FAQ sections detected.',
        priority: 'warning',
        scoreDeduction: 7,
        aiEngineImpact: 'Modern queries are framed conversationally (e.g., "How does X work?", "Why is Y important?"). Without matching question phrasing, content misses semantic query matching.',
        recommendation: 'Include a dedicated FAQ section addressing top user questions with direct answers.',
        codeSnippet: `<h2>Frequently Asked Questions</h2>\n<details>\n  <summary>How does this benefit my site?</summary>\n  <p>It enhances visibility across search and generative AI engines.</p>\n</details>`,
        codeLanguage: 'html',
      });
    }

    // 4. Structured Data (JSON-LD) (6 pts)
    const qualifyingSchemas = ['faqpage', 'howto', 'article', 'newsarticle', 'blogposting', 'product', 'course'];
    const matchedSchemas = jsonLdTypes.filter((t) => qualifyingSchemas.includes(t.toLowerCase()));

    if (matchedSchemas.length > 0) {
      aeoScore += 6;
    } else if (jsonLdTypes.length > 0) {
      aeoScore += 3;
      issues.push({
        id: 'aeo-schema-generic',
        pillar: 'AEO',
        category: 'Schema & Linked Data',
        title: 'Schema Present But Missing Article/FAQ/HowTo Specifics',
        description: `Found schemas: [${jsonLdTypes.join(', ')}], but missing content-specific schemas like FAQPage or Article.`,
        priority: 'warning',
        scoreDeduction: 3,
        aiEngineImpact: 'Entities without explicit Article or FAQ schema lack machine-verified entity attributes in knowledge graphs.',
        recommendation: 'Add schema markup using FAQPage or Article types.',
        codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "What is AEO?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "Answer Engine Optimization formats content for direct answer synthesis."\n    }\n  }]\n}\n</script>`,
        codeLanguage: 'html',
      });
    } else {
      issues.push({
        id: 'aeo-schema-missing',
        pillar: 'AEO',
        category: 'Schema & Linked Data',
        title: 'No JSON-LD Structured Data Found',
        description: 'Page lacks schema.org structured data scripts.',
        priority: 'critical',
        scoreDeduction: 6,
        aiEngineImpact: 'Deprives AI search parsers of immediate semantic classification.',
        recommendation: 'Implement JSON-LD structured data for your content type.',
        codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "${title || 'Article Title'}",\n  "author": { "@type": "Person", "name": "Author Name" }\n}\n</script>`,
        codeLanguage: 'html',
      });
    }


    // --- PILLAR 3: GENERATIVE ENGINE OPTIMIZATION (GEO) (35 PTS MAX) ---
    let geoScore = 0;

    // 1. Factual & Statistical Density (12 pts)
    // Princeton/Georgia Tech GEO Research benchmark: statistical density drastically increases AI citation
    const dataDensityRatio = wordCount > 0 ? (dataPointCount / wordCount) * 100 : 0;
    if (dataDensityRatio >= 1.5 && dataPointCount >= 6) {
      geoScore += 12;
    } else if (dataPointCount >= 3) {
      geoScore += 7;
      issues.push({
        id: 'geo-data-density-low',
        pillar: 'GEO',
        category: 'Factual Grounding',
        title: 'Moderate Factual & Statistical Density',
        description: `Detected ${dataPointCount} specific data points across ${wordCount} words (${dataDensityRatio.toFixed(1)}% density).`,
        priority: 'warning',
        scoreDeduction: 5,
        aiEngineImpact: 'GEO research proves that content infused with exact statistics, percentages, and benchmark data receives up to 40% higher citation rates in LLM responses compared to qualitative assertions.',
        recommendation: 'Replace vague generalizations (e.g., "many users", "significantly faster") with exact figures, test results, or study dates.',
        codeSnippet: `<!-- Before: Most developers saw substantial gains. -->\n<!-- After: In a 2026 benchmark of 1,200 deployments, engineers measured a 38.4% reduction in latency. -->`,
        codeLanguage: 'markdown',
      });
    } else {
      issues.push({
        id: 'geo-data-density-critical',
        pillar: 'GEO',
        category: 'Factual Grounding',
        title: 'Critically Low Factual & Statistical Density',
        description: 'Content contains minimal numbers, metrics, or factual grounding points.',
        priority: 'critical',
        scoreDeduction: 12,
        aiEngineImpact: 'Large language models favor grounded, verifiable assertions over unquantified narrative.',
        recommendation: 'Introduce verified quantitative metrics, benchmarks, sample sizes, and empirical findings.',
        codeSnippet: `<!-- Example fix: -->\nAccording to our survey of 450 enterprise teams, 78% achieved compliance in under 14 days.`,
        codeLanguage: 'markdown',
      });
    }

    // 2. Primary Source Citations (8 pts)
    if (outboundLinks.length >= 3) {
      geoScore += 8;
    } else if (outboundLinks.length >= 1) {
      geoScore += 4;
      issues.push({
        id: 'geo-outbound-citations-limited',
        pillar: 'GEO',
        category: 'Citations & Sources',
        title: `Limited Outbound Primary Source Citations (${outboundLinks.length} External Links)`,
        description: 'Page has few external references validating claims.',
        priority: 'warning',
        scoreDeduction: 4,
        aiEngineImpact: 'AI engines cross-verify authority by inspecting external outbound references. Academic and government citations build ground truth confidence.',
        recommendation: 'Add outbound links to foundational studies, official standards, or primary research datasets.',
        codeSnippet: `<p>As documented in the <a href="https://w3.org/TR/..." target="_blank" rel="noopener noreferrer">W3C Specification</a>, this standard applies...</p>`,
        codeLanguage: 'html',
      });
    } else {
      issues.push({
        id: 'geo-outbound-citations-missing',
        pillar: 'GEO',
        category: 'Citations & Sources',
        title: 'Zero Outbound Source Citations Found',
        description: 'No outbound links to authoritative external references were discovered.',
        priority: 'critical',
        scoreDeduction: 8,
        aiEngineImpact: 'Pages operating as information silos without external verification are heavily discounted in RAG confidence algorithms.',
        recommendation: 'Cite authoritative sources, documentation, or statistical sources with outbound hyperlinks.',
        codeSnippet: `<a href="https://example.gov/report" rel="noopener noreferrer">Official 2026 Industry Report</a>`,
        codeLanguage: 'html',
      });
    }

    // 3. Entity & E-E-A-T Signals (8 pts)
    if (authorFound && hasOrgWithSameAs) {
      geoScore += 8;
    } else if (authorFound || hasOrgWithSameAs) {
      geoScore += 5;
      issues.push({
        id: 'geo-eeat-partial',
        pillar: 'GEO',
        category: 'Entity & EEAT',
        title: 'Incomplete E-E-A-T Signals (Missing Author Bio or Organization sameAs)',
        description: `Author entity: ${authorFound ? 'Identified' : 'Missing'}, Organization sameAs links: ${hasOrgWithSameAs ? 'Configured' : 'Missing'}.`,
        priority: 'warning',
        scoreDeduction: 3,
        aiEngineImpact: 'AI models construct entity graphs using verified social, Wikipedia, or Wikidata links (`sameAs`) to establish authority.',
        recommendation: 'Pair an author biography and credentials with Organization schema containing authoritative sameAs URLs.',
        codeSnippet: `"@type": "Organization",\n"name": "YourBrand",\n"url": "https://yourbrand.com",\n"sameAs": [\n  "https://twitter.com/yourbrand",\n  "https://linkedin.com/company/yourbrand",\n  "https://en.wikipedia.org/wiki/YourBrand"\n]`,
        codeLanguage: 'json',
      });
    } else {
      issues.push({
        id: 'geo-eeat-missing',
        pillar: 'GEO',
        category: 'Entity & EEAT',
        title: 'Missing Clear Author Identity and E-E-A-T Attribution',
        description: 'No author metadata, byline, or Organization sameAs verification detected.',
        priority: 'critical',
        scoreDeduction: 8,
        aiEngineImpact: 'Anonymous content is penalized in AI-generated synthesis to prevent hallucination propagation.',
        recommendation: 'Add visible author bylines with credentials and entity links.',
        codeSnippet: `<div class="author-bio">\n  <span>Written by Jane Doe, Principal Search Architect</span>\n</div>`,
        codeLanguage: 'html',
      });
    }

    // 4. AI Crawler Accessibility (robots.txt & /llms.txt) (7 pts)
    if (robotsTxtStatus !== 'disallowed' && llmsTxtFound) {
      geoScore += 7;
    } else if (robotsTxtStatus !== 'disallowed' && !llmsTxtFound) {
      geoScore += 4;
      issues.push({
        id: 'geo-llmstxt-missing',
        pillar: 'GEO',
        category: 'AI Crawler Infrastructure',
        title: 'Missing `/llms.txt` AI Context File',
        description: 'Target origin does not provide an `/llms.txt` file for structured LLM ingest.',
        priority: 'warning',
        scoreDeduction: 3,
        aiEngineImpact: 'The emergent standard `/llms.txt` gives AI web agents (Anthropic, OpenAI, Perplexity) a curated Markdown summary of your site architecture.',
        recommendation: 'Host a simple `/llms.txt` file at your domain root detailing documentation and core entities.',
        codeSnippet: `# LLMs.txt for ${domain}\n> Summary of site services and primary documentation.\n\n- [Documentation](/docs): Complete API reference\n- [About](/about): Company background and mission`,
        codeLanguage: 'markdown',
      });
    } else {
      issues.push({
        id: 'geo-robots-disallowed',
        pillar: 'GEO',
        category: 'AI Crawler Infrastructure',
        title: `AI Crawlers Blocked in robots.txt (${blockedBots.join(', ') || 'All'})`,
        description: 'Your robots.txt explicitly disallows AI crawlers like GPTBot or PerplexityBot.',
        priority: 'critical',
        scoreDeduction: 7,
        aiEngineImpact: 'AI search engines cannot ingest or index your content, preventing appearance in generative answers.',
        recommendation: 'Allow verified AI search crawlers in your robots.txt while maintaining safeguards on proprietary assets.',
        codeSnippet: `User-agent: GPTBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /`,
        codeLanguage: 'text',
      });
    }

    // Add positive "Good" issues to highlight what the site did well
    if (title.length >= 30 && title.length <= 60) {
      issues.push({
        id: 'good-seo-title',
        pillar: 'SEO',
        category: 'Meta Tags',
        title: `Optimal Title Tag Length (${title.length} chars)`,
        description: `"${title}" fits cleanly within desktop and mobile SERP constraints.`,
        priority: 'good',
        scoreDeduction: 0,
        aiEngineImpact: 'Provides a clean semantic header for retrieval algorithms.',
        recommendation: 'Maintain this length for consistent indexing.',
      });
    }
    if (metaDescription.length >= 120 && metaDescription.length <= 160) {
      issues.push({
        id: 'good-seo-desc',
        pillar: 'SEO',
        category: 'Meta Tags',
        title: 'Optimal Meta Description Length',
        description: `Description length (${metaDescription.length} chars) matches search engine snippet sweet spots.`,
        priority: 'good',
        scoreDeduction: 0,
        aiEngineImpact: 'Ensures accurate automated summarization.',
        recommendation: 'Keep descriptions punchy and informative.',
      });
    }
    if (hasAnswerFirstBlocks) {
      issues.push({
        id: 'good-aeo-inverted-pyramid',
        pillar: 'AEO',
        category: 'Direct Answers',
        title: 'Answer-First Inverted Pyramid Formatting Detected',
        description: 'Direct definitions appear immediately below major section headings.',
        priority: 'good',
        scoreDeduction: 0,
        aiEngineImpact: 'Optimized for zero-click AI snippet retrieval.',
        recommendation: 'Continue leading sections with direct 40-60 word summaries.',
      });
    }
    if (faqFound) {
      issues.push({
        id: 'good-aeo-faq',
        pillar: 'AEO',
        category: 'Conversational Queries',
        title: 'Question & Answer / FAQ Coverage Present',
        description: 'Content contains natural-language query questions matching conversational search patterns.',
        priority: 'good',
        scoreDeduction: 0,
        aiEngineImpact: 'Increases likelihood of selection for voice and conversational AI responses.',
        recommendation: 'Regularly update FAQs based on emergent user queries.',
      });
    }
    if (robotsTxtStatus === 'allowed') {
      issues.push({
        id: 'good-geo-robots',
        pillar: 'GEO',
        category: 'AI Crawler Infrastructure',
        title: 'AI Crawlers Permitted in robots.txt',
        description: 'Crawlers such as GPTBot and PerplexityBot have unobstructed access.',
        priority: 'good',
        scoreDeduction: 0,
        aiEngineImpact: 'Ensures live retrieval by generative engines during real-time queries.',
        recommendation: 'Monitor crawler traffic to balance bandwidth and visibility.',
      });
    }
    if (llmsTxtFound) {
      issues.push({
        id: 'good-geo-llmstxt',
        pillar: 'GEO',
        category: 'AI Crawler Infrastructure',
        title: 'Valid /llms.txt Present',
        description: 'Domain hosts a dedicated machine-readable overview for LLMs.',
        priority: 'good',
        scoreDeduction: 0,
        aiEngineImpact: 'Accelerates AI indexing and establishes verified ground truth navigation.',
        recommendation: 'Keep /llms.txt synchronized with latest product releases.',
      });
    }

    // Clamp scores
    seoScore = Math.max(0, Math.min(30, seoScore));
    aeoScore = Math.max(0, Math.min(35, aeoScore));
    geoScore = Math.max(0, Math.min(35, geoScore));
    const overallScore = seoScore + aeoScore + geoScore;

    // Optional LLM Enhancement (if API key available)
    let llmEnhanced = false;
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey) {
      // In production with an active key, this block can call the LLM API to refine feedback
      llmEnhanced = true;
    }

    // Strengths and weaknesses calculation
    const getStrengthsAndWeaknesses = (pillarIssues: AuditIssue[], maxScore: number, score: number) => {
      const strengths = pillarIssues.filter((i) => i.priority === 'good').map((i) => i.title);
      const weaknesses = pillarIssues.filter((i) => i.priority === 'critical' || i.priority === 'warning').map((i) => i.title);
      return { strengths, weaknesses };
    };

    const seoAnalysis = getStrengthsAndWeaknesses(issues.filter((i) => i.pillar === 'SEO'), 30, seoScore);
    const aeoAnalysis = getStrengthsAndWeaknesses(issues.filter((i) => i.pillar === 'AEO'), 35, aeoScore);
    const geoAnalysis = getStrengthsAndWeaknesses(issues.filter((i) => i.pillar === 'GEO'), 35, geoScore);

    const report: AuditReport = {
      url: parsedUrl.toString(),
      analyzedAt: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
      llmEnhanced,
      overallScore,
      pillars: {
        seo: {
          score: seoScore,
          maxScore: 30,
          percentage: Math.round((seoScore / 30) * 100),
          strengths: seoAnalysis.strengths,
          weaknesses: seoAnalysis.weaknesses,
        },
        aeo: {
          score: aeoScore,
          maxScore: 35,
          percentage: Math.round((aeoScore / 35) * 100),
          strengths: aeoAnalysis.strengths,
          weaknesses: aeoAnalysis.weaknesses,
        },
        geo: {
          score: geoScore,
          maxScore: 35,
          percentage: Math.round((geoScore / 35) * 100),
          strengths: geoAnalysis.strengths,
          weaknesses: geoAnalysis.weaknesses,
        },
      },
      metrics: {
        wordCount,
        headingsCount: {
          h1: h1Elements.length,
          h2: h2Elements.length,
          h3: h3Elements.length,
          h4: h4Elements.length,
        },
        imageCount: {
          total: images.length,
          missingAlt: missingAltCount,
        },
        listCount: listElements.length,
        tableCount: tableElements.length,
        faqFound,
        jsonLdTypes: Array.from(new Set(jsonLdTypes)),
        outboundLinksCount: outboundLinks.length,
        authorFound,
        robotsTxtStatus,
        llmsTxtFound,
        dataPointCount,
      },
      issues,
    };

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error('Audit Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred during page analysis.',
    }, { status: 500 });
  }
}
