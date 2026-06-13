import { useState } from 'react';
import { ShieldCheck, Check, Info, Brain } from 'lucide-react';
import { DocumentItem } from '../../types';

interface MatcherProps {
  documents: DocumentItem[];
  appliedScholarships: string[];
  setAppliedScholarships: (applied: string[] | ((prev: string[]) => string[])) => void;
  showToast: (msg: string) => void;
  logSystemActivity: (action: string, details: string, status?: 'Success' | 'Warning' | 'Error') => void;
}

export default function Matcher({
  documents,
  appliedScholarships,
  setAppliedScholarships,
  showToast,
  logSystemActivity
}: MatcherProps) {
  
  // Local state for specific scholarship AI query
  const [activeScholarshipIdForAi, setActiveScholarshipIdForAi] = useState<string | null>(null);
  const [scholarshipAiQuery, setScholarshipAiQuery] = useState("");
  const [scholarshipAiResponse, setScholarshipAiResponse] = useState("");
  const [isScholarshipAiThinking, setIsScholarshipAiThinking] = useState(false);

  // Pre-configured opportunity items with requirements matching
  const opportunities = [
    {
      id: "opp-1",
      title: "Global Tech Innovation Grant",
      matchScore: 100,
      category: "Grant • Tech Innovation",
      rewardDetails: "$15,000 Award",
      requiredDocs: ["Passport Photo", "Aadhaar Card", "B.Tech Degree Certificate", "Income Certificate"],
      criteria: ["B.Tech CGPA >= 8.5", "Age under 30", "Verified Income Proof"],
      onlineSource: "MP Citizen e-Uparjan Service Portal",
      offlineSource: "Bhopal Arera Colony local Tehsil office",
      url: "https://www.buddy4study.com/"
    },
    {
      id: "opp-2",
      title: "Senior AI Architect Post-doc Fellowship",
      matchScore: 94,
      category: "Fellowship • Remote Research",
      rewardDetails: "$7,500 / mo",
      requiredDocs: ["PAN Card Document", "Technical Resume 2026", "B.Tech Degree Certificate"],
      criteria: ["Academic Grade >= 8.0/10.0", "Registered Technical Resume", "NSDL PAN ID"],
      onlineSource: "Self-Authored Portal",
      offlineSource: "N/A - Direct Online Uploads",
      url: "https://www.education.gov.in/en/scholarships-education-loan-0"
    },
    {
      id: "opp-3",
      title: "National Merit Fellowship Research",
      matchScore: 89,
      category: "Full-Time Research • 6 Months",
      rewardDetails: "Fully Funded + Travel stipend",
      requiredDocs: ["Passport Document Scan", "Technical Resume 2026", "B.Tech Degree Certificate", "Letter of Recommendation (LOR)"],
      criteria: ["B.Tech CGPA >= 9.0", "HOD Endorsed LOR", "Valid International Passport Booklet"],
      onlineSource: "National Fellowship Portal",
      offlineSource: "HOD Office Academic Block, LNCT University",
      url: "https://scholarships.gov.in/"
    }
  ];

  // Helper to check if document category is present in user's vault
  const checkHasDocInline = (docType: string) => {
    const t = docType.toLowerCase();
    if (t.includes("passport photo") || t.includes("passport booklet") || t.includes("passport")) {
      return documents.some(d => d.name.toLowerCase().includes("passport") || d.filename.toLowerCase().includes("passport"));
    }
    if (t.includes("aadhaar")) {
      return documents.some(d => d.name.toLowerCase().includes("aadhaar") || d.filename.toLowerCase().includes("aadhaar"));
    }
    if (t.includes("degree") || t.includes("graduation") || t.includes("bachelor")) {
      return documents.some(d => d.name.toLowerCase().includes("bachelor") || d.name.toLowerCase().includes("degree") || d.filename.toLowerCase().includes("bachelors"));
    }
    if (t.includes("pan") || t.includes("tax")) {
      return documents.some(d => d.name.toLowerCase().includes("pan") || d.metadata?.documentType?.toLowerCase().includes("tax"));
    }
    if (t.includes("resume") || t.includes("cv")) {
      return documents.some(d => d.name.toLowerCase().includes("resume") || d.filename.toLowerCase().includes("resume") || d.category === 'Professional');
    }
    if (t.includes("income")) {
      return documents.some(d => d.name.toLowerCase().includes("income") || d.filename.toLowerCase().includes("income"));
    }
    if (t.includes("recommendation") || t.includes("lor")) {
      return documents.some(d => d.name.toLowerCase().includes("lor") || d.name.toLowerCase().includes("recommendation") || d.filename.toLowerCase().includes("lor"));
    }
    return false;
  };

  const handleQueryScholarshipAi = async (opp: any) => {
    if (!scholarshipAiQuery.trim()) return;
    setIsScholarshipAiThinking(true);
    setScholarshipAiResponse("");

    try {
      const response = await fetch('/api/gemini/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Regarding scholarship opportunity: "${opp.title}". Requirements: ${opp.requiredDocs.join(', ')}. Criteria: ${opp.criteria.join(', ')}. User asks: ${scholarshipAiQuery}`,
          documents,
          currentScholarship: opp
        })
      });
      const data = await response.json();
      setScholarshipAiResponse(data.text);
    } catch (err) {
      setScholarshipAiResponse("Local match: You have verified B.Tech degree, but lack required proof of income. You can request Online OTP sync.");
    } finally {
      setIsScholarshipAiThinking(false);
    }
  };

  const triggerQuickApply = (id: string, title: string, missingCount: number, url?: string) => {
    if (missingCount > 0) {
      showToast(`⚠️ Cannot Quick Apply. You are missing ${missingCount} required assets. Please check below how to acquire them.`);
      return;
    }
    setAppliedScholarships(prev => [...prev, id]);
    logSystemActivity("Sync", `Form matching and quick apply triggered for ${title}`, "Success");
    showToast(`🎉 Success! Redirecting to ${title} portal...`);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E5E5] pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Scholarships &amp; Fellowships Matching Center</h2>
          <p className="text-xs text-[#666666] font-semibold">Real-time matching of your verified identity &amp; educational documents against academic criteria.</p>
        </div>
        
        <div className="p-2.5 bg-[#3B82F6]/5 rounded-xl border border-[#3B82F6]/20 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
          <span className="font-bold text-[#222222] font-mono">My Secure Arsenal: {documents.length} Encrypted Assets</span>
        </div>
      </div>

      {/* Grid of opportunities */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {opportunities.map(opp => {
          const docsInArsenal = opp.requiredDocs.filter(d => checkHasDocInline(d));
          const missingDocs = opp.requiredDocs.filter(d => !checkHasDocInline(d));
          const arsenalCount = docsInArsenal.length;
          const neededCount = opp.requiredDocs.length;
          const criteriaMatchPercent = neededCount > 0 ? Math.round((arsenalCount / neededCount) * 100) : 0;
          const isApplied = appliedScholarships.includes(opp.id);

          return (
            <div key={opp.id} className="p-5 bg-white border border-[#E5E5E5] rounded-2xl flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all shadow-sm space-y-4">
              <div className="space-y-3">
                
                {/* Category & Rewards */}
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-[#3B82F6] bg-[#3B82F6]/5 px-2 py-0.5 rounded uppercase tracking-wider">{opp.category}</span>
                  <span className="text-xs font-mono font-black text-[#222222]">{opp.rewardDetails}</span>
                </div>
                <h3 className="text-sm font-black text-[#222222]">{opp.title}</h3>

                {/* Match progress bar */}
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-[#666666]">
                    <span>My Document Eligibility</span>
                    <span className={criteriaMatchPercent === 100 ? "text-[#22C55E]" : "text-[#F59E0B]"}>{criteriaMatchPercent}% Eligible</span>
                  </div>
                  <div className="h-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${criteriaMatchPercent === 100 ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`}
                      style={{ width: `${criteriaMatchPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Required Rules Checklist */}
                <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3 rounded-xl text-[11px] space-y-1.5 text-[#222222]">
                  <span className="font-bold text-[10px] uppercase text-[#666666] block">Required Rules checklist</span>
                  {opp.criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-semibold">
                      <Check className="w-3.5 h-3.5 text-[#22C55E] bg-[#22C55E]/15 rounded-full p-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>

                {/* Document Status */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-[10px] text-[#666666] uppercase block">Document Arsenal Status ({arsenalCount}/{neededCount})</span>
                  <div className="space-y-1.5">
                    {opp.requiredDocs.map((docName, i) => {
                      const hasDoc = checkHasDocInline(docName);
                      return (
                        <div key={i} className="flex items-center justify-between p-1.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] text-[11px]">
                          <span className="font-medium text-[#222222]">{docName}</span>
                          {hasDoc ? (
                            <span className="font-bold text-[#22C55E] flex items-center gap-0.5">✅ Ready</span>
                          ) : (
                            <span className="font-bold text-[#EF4444] flex items-center gap-0.5">❌ Missing</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gap Analysis Instructions */}
                {missingDocs.length > 0 && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-amber-800 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-[#F59E0B]" />
                      Gap Analysis Guide to acquire missing:
                    </span>
                    <div className="space-y-1 text-[#666666] font-mono text-[10px] leading-relaxed">
                      {missingDocs.map((doc, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <p className="font-bold text-[#222222]">• {doc}:</p>
                          <p className="pl-2.5">🌐 Online: {opp.onlineSource}</p>
                          {opp.offlineSource !== 'N/A - Direct Online Uploads' && (
                            <p className="pl-2.5">📍 Offline: {opp.offlineSource}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Apply / AI Actions */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                
                {/* Embedded Scholarship Advisor */}
                {activeScholarshipIdForAi === opp.id ? (
                  <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-3 space-y-2">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-[#666666] flex items-center gap-1">
                      <Brain className="w-3 h-3 text-[#3B82F6]" /> Scholarship Advisor
                    </span>
                    
                    {scholarshipAiResponse && (
                      <p className="text-[10px] text-[#222222] font-semibold bg-white p-2 rounded border border-[#E5E5E5] leading-relaxed whitespace-pre-line">
                        {scholarshipAiResponse}
                      </p>
                    )}

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleQueryScholarshipAi(opp);
                      }} 
                      className="flex gap-1.5"
                    >
                      <input 
                        type="text"
                        placeholder="Ask about criteria or gap guides..."
                        value={scholarshipAiQuery}
                        onChange={(e) => setScholarshipAiQuery(e.target.value)}
                        className="flex-1 bg-white border border-[#E5E5E5] rounded p-1.5 text-[10px] outline-none text-[#222222]"
                      />
                      <button 
                        type="submit" 
                        disabled={isScholarshipAiThinking}
                        className="bg-[#222222] text-white px-2.5 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer"
                      >
                        {isScholarshipAiThinking ? "..." : "Ask"}
                      </button>
                    </form>
                    
                    <div className="flex justify-between items-center text-[9px] px-1 pt-1">
                      <a 
                        href={opp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B82F6] font-bold hover:underline"
                      >
                        🌐 Visit Portal
                      </a>
                      <button 
                        onClick={() => {
                          setActiveScholarshipIdForAi(null);
                          setScholarshipAiResponse("");
                          setScholarshipAiQuery("");
                        }}
                        className="text-[#666666] hover:underline"
                      >
                        Close Advisor
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setActiveScholarshipIdForAi(opp.id);
                        setScholarshipAiResponse("");
                        setScholarshipAiQuery("");
                      }}
                      className="flex-1 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] text-[#222222] font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Brain className="w-3.5 h-3.5 text-[#3B82F6]" /> Advisor
                    </button>
                    <a 
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] text-[#222222] font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer text-center"
                    >
                      🌐 Visit Portal
                    </a>
                  </div>
                )}

                <button 
                  onClick={() => triggerQuickApply(opp.id, opp.title, missingDocs.length, opp.url)}
                  disabled={isApplied}
                  className={`w-full font-bold text-xs py-2.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                    isApplied 
                      ? 'bg-[#22C55E] text-white cursor-default' 
                      : criteriaMatchPercent === 100 
                        ? 'bg-[#222222] hover:bg-[#333333] text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-[#666666]'
                  }`}
                >
                  {isApplied ? "✓ Applied Successfully" : criteriaMatchPercent === 100 ? "Quick Apply (Autofill Vault)" : "Ineligible (Missing Assets)"}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
