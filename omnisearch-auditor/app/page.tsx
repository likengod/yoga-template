'use client';

import React, { useState } from 'react';
import {
  AuditReport,
  AuditIssue,
  PillarCategory,
  PriorityLevel,
} from '@/lib/types';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Bot,
  Layers,
  FileCode2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);

  // Filter States
  const [activePillar, setActivePillar] = useState<'ALL' | PillarCategory>('ALL');
  const [activePriority, setActivePriority] = useState<'ALL' | PriorityLevel>('ALL');
  const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick preset samples
  const sampleUrls = [
    'https://nextjs.org',
    'https://stripe.com',
    'https://en.wikipedia.org/wiki/Artificial_intelligence',
  ];

  const handleAudit = async (targetUrl?: string) => {
    const inputUrl = targetUrl || url;
    if (!inputUrl.trim()) {
      setError('Please enter a valid webpage URL to audit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete analysis.');
      }

      setReport(data.data);
      // Automatically expand critical issues by default
      const defaultExpanded: Record<string, boolean> = {};
      data.data.issues.forEach((i: AuditIssue) => {
        if (i.priority === 'critical') defaultExpanded[i.id] = true;
      });
      setExpandedIssues(defaultExpanded);
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the URL.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `omnisearch-audit-${new URL(report.url).hostname}.json`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  // Filtered issues
  const filteredIssues = report?.issues.filter((issue) => {
    const matchesPillar = activePillar === 'ALL' || issue.pillar === activePillar;
    const matchesPriority = activePriority === 'ALL' || issue.priority === activePriority;
    return matchesPillar && matchesPriority;
  }) || [];

  // Helper color logic for gauges
  const getScoreColor = (score: number, maxScore: number = 100) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 85) return 'text-emerald-400 stroke-emerald-400';
    if (pct >= 65) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getScoreBg = (score: number, maxScore: number = 100) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 85) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    if (pct >= 65) return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-cyan-600/10 to-transparent blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Search Optimization Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            OmniSearch <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">Auditor</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Evaluate your content across the 3 search frontiers: Traditional <strong>SEO</strong>, Answer Engine Optimization (<strong>AEO</strong>), and Generative Engine Optimization (<strong>GEO</strong>).
          </p>
        </header>

        {/* Input Form */}
        <div className="max-w-3xl mx-auto mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAudit();
            }}
            className="flex flex-col sm:flex-row gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur focus-within:border-indigo-500 transition-all"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com/article"
                className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Page...
                </>
              ) : (
                <>
                  Audit Website
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick preset links */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            <span>Try sample URLs:</span>
            {sampleUrls.map((sUrl) => (
              <button
                key={sUrl}
                type="button"
                onClick={() => {
                  setUrl(sUrl);
                  handleAudit(sUrl);
                }}
                className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition-colors"
              >
                {new URL(sUrl).hostname}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Audit Results Dashboard */}
        {report && (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Top Bar Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate max-w-md">
                      {report.url}
                    </span>
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-indigo-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-500">
                    Audited in {report.executionTimeMs}ms • {report.llmEnhanced ? 'Deep AI Evaluated' : 'Heuristic Engine'}
                  </p>
                </div>
              </div>
              <button
                onClick={exportReport}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON Report
              </button>
            </div>

            {/* Score Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Score */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/40 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
                <div className="relative w-28 h-28 flex items-center justify-center my-2">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={`${getScoreColor(report.overallScore)} transition-all duration-1000 ease-out`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - report.overallScore / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{report.overallScore}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">/ 100</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-base">Overall Search Score</h3>
                <p className="text-xs text-slate-400 mt-1">Blended SEO + AEO + GEO health</p>
              </div>

              {/* Traditional SEO */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Pillar 1</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getScoreBg(report.pillars.seo.score, 30)}`}>
                      {report.pillars.seo.score} / 30 pts
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Traditional SEO</h3>
                  <p className="text-xs text-slate-400 mt-1">Technical markup, meta tags, headers & crawlability.</p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-700"
                      style={{ width: `${report.pillars.seo.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Target: 30 pts</span>
                    <span>{report.pillars.seo.percentage}% Compliance</span>
                  </div>
                </div>
              </div>

              {/* Answer Engine Optimization (AEO) */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pillar 2</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getScoreBg(report.pillars.aeo.score, 35)}`}>
                      {report.pillars.aeo.score} / 35 pts
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Answer Engine (AEO)</h3>
                  <p className="text-xs text-slate-400 mt-1">Direct answers, inverted pyramid, FAQs & schema.</p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-700"
                      style={{ width: `${report.pillars.aeo.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Target: 35 pts</span>
                    <span>{report.pillars.aeo.percentage}% Compliance</span>
                  </div>
                </div>
              </div>

              {/* Generative Engine Optimization (GEO) */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pillar 3</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getScoreBg(report.pillars.geo.score, 35)}`}>
                      {report.pillars.geo.score} / 35 pts
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Generative Engine (GEO)</h3>
                  <p className="text-xs text-slate-400 mt-1">Factual density, citations, E-E-A-T & AI crawler access.</p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-700"
                      style={{ width: `${report.pillars.geo.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Target: 35 pts</span>
                    <span>{report.pillars.geo.percentage}% Compliance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & AI Telemetry Stats */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Crawled Telemetry & Structural Indicators
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-500 block">Total Words</span>
                  <span className="text-lg font-bold text-white">{report.metrics.wordCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-500 block">Headings (H1/H2)</span>
                  <span className="text-lg font-bold text-white">
                    {report.metrics.headingsCount.h1} / {report.metrics.headingsCount.h2}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-500 block">Tables & Lists</span>
                  <span className="text-lg font-bold text-white">
                    {report.metrics.tableCount} / {report.metrics.listCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-500 block">Factual Metrics</span>
                  <span className="text-lg font-bold text-white">{report.metrics.dataPointCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-500 block">AI Bots in robots.txt</span>
                  <span className={`text-xs font-bold block mt-1 ${report.metrics.robotsTxtStatus === 'allowed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {report.metrics.robotsTxtStatus === 'allowed' ? 'Allowed' : 'Blocked / Strict'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-500 block">/llms.txt Present</span>
                  <span className={`text-xs font-bold block mt-1 ${report.metrics.llmsTxtFound ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {report.metrics.llmsTxtFound ? 'Yes (Active)' : 'Not Found'}
                  </span>
                </div>
              </div>
            </div>

            {/* Filterable Issues & Action Items Section */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Audit Issues & Copy-Paste Fixes</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Showing {filteredIssues.length} of {report.issues.length} audit items
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Pillar Tabs */}
                  <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    {(['ALL', 'SEO', 'AEO', 'GEO'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActivePillar(tab)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          activePillar === tab
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab === 'ALL' ? 'All Pillars' : tab}
                      </button>
                    ))}
                  </div>

                  {/* Priority Filter */}
                  <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    {(['ALL', 'critical', 'warning', 'good'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setActivePriority(p)}
                        className={`px-2.5 py-1.5 rounded-lg capitalize font-medium transition-all ${
                          activePriority === p
                            ? 'bg-slate-800 text-white border border-slate-700'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Issues List */}
              <div className="space-y-4">
                {filteredIssues.map((issue) => {
                  const isExpanded = Boolean(expandedIssues[issue.id]);

                  return (
                    <div
                      key={issue.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all hover:border-slate-700"
                    >
                      {/* Issue Header Card */}
                      <div
                        onClick={() => toggleExpand(issue.id)}
                        className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-start gap-3">
                          {issue.priority === 'critical' && (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          {issue.priority === 'warning' && (
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          {issue.priority === 'good' && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          )}

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                                {issue.pillar}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">{issue.category}</span>
                              {issue.scoreDeduction > 0 && (
                                <span className="text-xs text-rose-400 font-medium">
                                  -{issue.scoreDeduction} pts
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-semibold text-white">{issue.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {issue.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                              issue.priority === 'critical'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                : issue.priority === 'warning'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {issue.priority}
                          </span>
                          <button className="text-slate-400 hover:text-white p-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Action & Code Fix Area */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-4 text-xs">
                          {/* AI / Search Engine Impact */}
                          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 flex items-start gap-2.5">
                            <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                            <div>
                              <strong className="font-semibold block text-indigo-200">
                                Impact on Perplexity, ChatGPT Search & Google AI Overviews:
                              </strong>
                              <p className="mt-0.5 text-indigo-300/90 leading-relaxed">
                                {issue.aiEngineImpact}
                              </p>
                            </div>
                          </div>

                          {/* Recommendation */}
                          <div>
                            <strong className="text-slate-300 font-semibold block mb-1">
                              Actionable Recommendation:
                            </strong>
                            <p className="text-slate-400 leading-relaxed">{issue.recommendation}</p>
                          </div>

                          {/* Copy-Paste Code Fix */}
                          {issue.codeSnippet && (
                            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-800/60 border-b border-slate-800 text-[11px] text-slate-400">
                                <span>Recommended Code / Schema Fix:</span>
                                <button
                                  onClick={() => copyToClipboard(issue.codeSnippet!, issue.id)}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                                >
                                  {copiedId === issue.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-3.5 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {issue.codeSnippet}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <div className="text-center py-12 border border-slate-800 rounded-2xl bg-slate-900/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">No issues found for this filter criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Select "All Pillars" or "All" priorities to view all items.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
