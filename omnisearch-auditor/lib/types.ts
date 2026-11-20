export type PriorityLevel = 'critical' | 'warning' | 'good';
export type PillarCategory = 'SEO' | 'AEO' | 'GEO';

export interface AuditIssue {
  id: string;
  pillar: PillarCategory;
  category: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  scoreDeduction: number;
  aiEngineImpact: string;
  recommendation: string;
  codeSnippet?: string;
  codeLanguage?: string;
}

export interface PillarScoreBreakdown {
  score: number;
  maxScore: number;
  percentage: number;
  strengths: string[];
  weaknesses: string[];
}

export interface AuditReport {
  url: string;
  analyzedAt: string;
  executionTimeMs: number;
  llmEnhanced: boolean;
  overallScore: number;
  pillars: {
    seo: PillarScoreBreakdown;
    aeo: PillarScoreBreakdown;
    geo: PillarScoreBreakdown;
  };
  metrics: {
    wordCount: number;
    headingsCount: { h1: number; h2: number; h3: number; h4: number };
    imageCount: { total: number; missingAlt: number };
    listCount: number;
    tableCount: number;
    faqFound: boolean;
    jsonLdTypes: string[];
    outboundLinksCount: number;
    authorFound: boolean;
    robotsTxtStatus: 'allowed' | 'disallowed' | 'not_found' | 'error';
    llmsTxtFound: boolean;
    dataPointCount: number;
  };
  issues: AuditIssue[];
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AuditReport;
  error?: string;
}
