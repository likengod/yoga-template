import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, ChevronDown, ChevronUp, FileText, MessageSquare, Scale, RefreshCcw, Cookie, Loader2 } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface PolicyLayoutProps {
  title: string;
  content: string;
  isLoading: boolean;
  icon: React.ElementType;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({ title, content, isLoading, icon: Icon }) => {
  useScrollToTop();
  const location = useLocation();
  const [otherPoliciesOpen, setOtherPoliciesOpen] = useState(true);

  const policies = [
    { name: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
    { name: 'Terms & Conditions', path: '/terms-conditions', icon: Scale },
    { name: 'Refund Policy', path: '/refund-policy', icon: RefreshCcw },
    { name: 'Cookies Policy', path: '/cookies-policy', icon: Cookie },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#fafbfc] font-inter text-[#334155]">
      <Header />
      
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          
          {/* Sidebar */}
          <aside className="w-full md:w-80 shrink-0">
            <h2 className="text-xl font-semibold text-[#0f172a] mb-6 px-2">Policy Centre</h2>
            
            <div className="space-y-2">
              {policies.map((policy) => {
                const isActive = location.pathname === policy.path;
                if (isActive) {
                  return (
                    <div key={policy.path} className="flex items-center justify-between bg-[#111827] text-white px-4 py-4 rounded-xl shadow-lg">
                      <div className="flex items-center space-x-3">
                        <policy.icon size={18} className="text-white/80" />
                        <span className="font-medium">{policy.name}</span>
                      </div>
                      <ChevronUp size={16} className="text-white/60" />
                    </div>
                  );
                }
                return null;
              })}

              <div className="pt-2">
                <button 
                  onClick={() => setOtherPoliciesOpen(!otherPoliciesOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-[#475569] hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <FileText size={18} className="text-[#94a3b8]" />
                    <span className="font-medium">Other Policies</span>
                  </div>
                  {otherPoliciesOpen ? <ChevronUp size={16} className="text-[#94a3b8]" /> : <ChevronDown size={16} className="text-[#94a3b8]" />}
                </button>
                
                {otherPoliciesOpen && (
                  <div className="ml-11 mt-1 space-y-1">
                    {policies.map((policy) => {
                      if (location.pathname !== policy.path) {
                        return (
                          <Link 
                            key={policy.path} 
                            to={policy.path}
                            className="block py-2 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors"
                          >
                            {policy.name}
                          </Link>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>

              <Link to="/contact" className="w-full flex items-center px-4 py-3 text-[#475569] hover:bg-white hover:shadow-sm rounded-lg transition-all mt-2">
                <div className="flex items-center space-x-3">
                  <MessageSquare size={18} className="text-[#94a3b8]" />
                  <span className="font-medium">Connect Us</span>
                </div>
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-[#f1f5f9]">
              
              <div className="mb-10">
                <div className="flex items-center space-x-3 mb-6">
                  <Icon size={32} className="text-[#1e293b]" />
                  <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">{title}</h1>
                </div>
                
                <p className="text-xs font-semibold tracking-[0.1em] text-[#94a3b8] uppercase mb-8">
                  NARRATIVE SYNC: {currentDate}
                </p>
                <div className="w-full h-px bg-[#f1f5f9]"></div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#cbd5e1]" />
                  <p className="text-[#64748b] font-medium">Loading policy content...</p>
                </div>
              ) : content ? (
                <div 
                  className="prose prose-slate max-w-none prose-headings:text-[#0f172a] prose-headings:font-semibold prose-p:text-[#475569] prose-p:leading-relaxed prose-a:text-[#3b82f6] hover:prose-a:text-[#2563eb]"
                  dangerouslySetInnerHTML={{ __html: content }} 
                />
              ) : (
                <div className="text-center py-16">
                  <Icon className="w-16 h-16 mx-auto text-[#e2e8f0] mb-4" />
                  <h3 className="text-xl font-bold text-[#334155] mb-2">Content Not Available</h3>
                  <p className="text-[#64748b]">The policy content is currently being updated. Please check back later.</p>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PolicyLayout;
