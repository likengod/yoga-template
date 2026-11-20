# OmniSearch Auditor (SEO + AEO + GEO Analyzer)

OmniSearch Auditor is an evaluation platform for the modern search landscape. It crawls web pages and calculates an overall score (0–100) across the 3 critical search pillars:
1. **Traditional SEO (30 Points)**: Technical HTML, Title & Meta Description limits, Canonical, OpenGraph, Viewport, and Image Alt attributes.
2. **Answer Engine Optimization (AEO) (35 Points)**: Inverted-pyramid formatting, direct 40–60 word answer summaries below H2s, structured comparison tables and lists, natural query Q&A/FAQs, and JSON-LD schema (`FAQPage`, `Article`, `HowTo`).
3. **Generative Engine Optimization (GEO) (35 Points)**: Factual & statistical density, primary source outbound citations, E-E-A-T entity signals (Author bios, Organization `sameAs`), and AI crawler permissions in `/robots.txt` (`GPTBot`, `PerplexityBot`) + `/llms.txt`.

---

## Getting Started Locally

### 1. Navigate to the project directory:
```bash
cd omnisearch-auditor
```

### 2. Install dependencies:
```bash
npm install
```

### 3. (Optional) Configure AI Evaluation API Key:
Create a `.env.local` file:
```env
GEMINI_API_KEY="your-gemini-key"
# or
OPENAI_API_KEY="your-openai-key"
```
*Note: If no API key is specified, the engine operates using its built-in deterministic heuristic scoring engine.*

### 4. Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scoring Rubric Breakdown (100 Points)

| Pillar | Max Score | Key Factors |
| :--- | :--- | :--- |
| **Traditional SEO** | 30 | Title tag length (30-60 chars) [5], Meta description (120-160 chars) [5], Single H1 & H2 structure [8], Canonical & OG tags [4], Image Alt tags [4], Mobile Viewport [4] |
| **Answer Engine (AEO)** | 35 | Inverted pyramid answer-first summaries [12], Lists & Comparison tables [10], FAQ coverage [7], Schema.org JSON-LD [6] |
| **Generative Engine (GEO)**| 35 | Factual & statistical density [12], Primary source citations [8], Author & Organization E-E-A-T [8], AI crawler access & `/llms.txt` [7] |
