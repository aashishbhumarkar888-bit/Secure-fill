import React, { useState, useRef, useEffect } from 'react';
import { Brain, FileText, Send, Sparkles, AlertCircle } from 'lucide-react';
import { DocumentItem } from '../../types';

interface ChatAssistantProps {
  documents: DocumentItem[];
  assistantLogs: any[];
  setAssistantLogs: (logs: any[] | ((prev: any[]) => any[])) => void;
  showToast: (msg: string) => void;
  setSelectedDoc: (doc: DocumentItem | null) => void;
  setActiveTab: (tab: string) => void;
}

export default function ChatAssistant({
  documents,
  assistantLogs,
  setAssistantLogs,
  showToast,
  setSelectedDoc,
  setActiveTab
}: ChatAssistantProps) {
  
  const [query, setQuery] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("all");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantLogs, isThinking]);

  // Suggested prompt actions
  const suggestedPrompts = [
    { text: "What is my Passport number and expiry?", icon: "✈️" },
    { text: "What is my B.Tech graduation CGPA?", icon: "🎓" },
    { text: "Do I match criteria for Global Tech Innovation Grant?", icon: "🎯" },
    { text: "List my missing credentials for scholarships", icon: "📋" }
  ];

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Append user message
    const userMsg = {
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantLogs(prev => [...prev, userMsg]);
    setQuery("");
    setIsThinking(true);

    try {
      const selectedDocument = selectedDocId === "all" ? null : documents.find(d => d.id === selectedDocId);
      
      const activeToken = localStorage.getItem('securefill_auth_token') || '';
      const response = await fetch('/api/gemini/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ 
          query: queryText, 
          documents: selectedDocument ? [selectedDocument] : documents,
          currentScholarship: null 
        })
      });
      const data = await response.json();
      
      // Parse citations if they exist in text (e.g. document name tags)
      const parsedText = data.text;
      
      // AI Response message
      const aiMsg = {
        sender: 'ai',
        text: parsedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        // Include reference buttons if specific documents are mentioned
        referencedDocIds: documents
          .filter(d => queryText.toLowerCase().includes(d.name.split('_')[0].toLowerCase()) || parsedText.toLowerCase().includes(d.name.toLowerCase()) || parsedText.toLowerCase().includes(d.filename.toLowerCase()))
          .map(d => d.id)
      };

      setIsThinking(false);
      setAssistantLogs(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed assistant query:", err);
      setIsThinking(false);
      setAssistantLogs(prev => [...prev, {
        sender: 'ai',
        text: "My secure local RAG query engine encountered an error. Please verify the server is running on port 3000.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const renderMessageContent = (text: string) => {
    // Detect document names and replace them with clickable styled source tags
    let elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Find references like "Ashish_Ghumarkar_Passport_Photo.jpg" or "Aadhaar_Card_Verified.pdf"
    documents.forEach(doc => {
      const name = doc.filename || doc.name;
      const index = text.indexOf(name);
      if (index !== -1 && index >= lastIndex) {
        // Append text before match
        if (index > lastIndex) {
          elements.push(text.substring(lastIndex, index));
        }
        // Append styled match button
        elements.push(
          <button
            key={doc.id}
            onClick={() => {
              setSelectedDoc(doc);
              setActiveTab('Vault');
              showToast(`Opening preview for ${doc.name}`);
            }}
            className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 font-mono text-[10px] font-bold border border-[#3B82F6]/20 transition-all cursor-pointer"
          >
            <FileText className="w-2.5 h-2.5" />
            {doc.name.split('_').slice(-2).join('_')}
          </button>
        );
        lastIndex = index + name.length;
      }
    });

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Header */}
      <div className="border-b border-[#E5E5E5] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#222222] flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#3B82F6]" /> Decrypt AI Vault Assistant
          </h2>
          <p className="text-xs text-[#666666] font-semibold">Ask questions, request summaries, and extract metadata parameters from all encrypted files in your vault using local RAG indexes.</p>
        </div>

        {/* Selected Context Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#666666] whitespace-nowrap">Chat Scope:</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-white border border-[#E5E5E5] text-xs font-semibold rounded-lg p-2 text-[#222222] focus:ring-1 focus:ring-[#3B82F6] outline-none shadow-xs"
          >
            <option value="all">📁 Entire Document Vault ({documents.length})</option>
            {documents.map(d => (
              <option key={d.id} value={d.id}>📄 {d.name.substring(0, 30)}...</option>
            ))}
          </select>
        </div>
      </div>

      {documents.length === 0 ? (
        /* Empty onboarding state when no documents exist */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-[#E5E5E5] rounded-2xl space-y-4 shadow-sm max-w-lg mx-auto my-auto">
          <AlertCircle className="w-12 h-12 text-[#3B82F6] opacity-75" />
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-[#222222]">No Vault Files Found</h3>
            <p className="text-xs text-[#666666] max-w-sm">
              To chat with your documents, please upload your files (Passport, B.Tech Degree, Aadhaar, Resume, etc.) in the **Encrypted Vault** section first.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('Vault')}
            className="bg-[#222222] hover:bg-[#333333] text-white text-xs font-bold py-2.5 px-6 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            Go to Vault &amp; Upload
          </button>
        </div>
      ) : (
        /* Chat flow stream */
        <div className="flex-1 flex flex-col justify-between bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
          
          {/* Scrollable messages container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar">
            {assistantLogs.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Sender Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border select-none ${
                  msg.sender === 'user' 
                    ? 'bg-blue-50 border-blue-100 text-[#3B82F6]' 
                    : 'bg-[#222222] border-[#222222] text-white'
                }`}>
                  {msg.sender === 'user' ? '👤' : '🤖'}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#3B82F6]/10 text-[#222222] font-semibold rounded-tr-none'
                      : 'bg-[#FAFAFA] border border-[#E5E5E5] text-[#222222] rounded-tl-none'
                  }`}>
                    {msg.sender === 'ai' ? renderMessageContent(msg.text) : msg.text}
                  </div>
                  
                  {/* Timestamp & Citation trigger links */}
                  <div className={`flex items-center gap-2 text-[10px] text-[#666666] px-1 font-mono ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    <span>{msg.timestamp}</span>
                    {msg.source && <span>• {msg.source}</span>}
                  </div>

                  {/* Referenced source documents buttons block */}
                  {msg.referencedDocIds && msg.referencedDocIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 px-1">
                      <span className="text-[10px] text-[#666666] font-bold self-center mr-1">Sources:</span>
                      {msg.referencedDocIds.map((docId: string) => {
                        const referencedDoc = documents.find(d => d.id === docId);
                        if (!referencedDoc) return null;
                        return (
                          <button
                            key={docId}
                            onClick={() => {
                              setSelectedDoc(referencedDoc);
                              setActiveTab('Vault');
                              showToast(`Displaying metadata parameters for: ${referencedDoc.name}`);
                            }}
                            className="bg-[#FAFAFA] hover:bg-[#F5F5F5] border border-[#E5E5E5] px-2 py-0.5 rounded text-[9px] font-bold text-[#222222] transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <FileText className="w-3 h-3 text-[#3B82F6]" />
                            {referencedDoc.name.substring(0, 20)}...
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Thinking Typing State */}
            {isThinking && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-[#222222] text-white flex items-center justify-center shrink-0 border select-none">
                  🤖
                </div>
                <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3.5 rounded-2xl rounded-tl-none text-xs text-[#666666] italic flex items-center gap-2 shadow-xs select-none">
                  <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] animate-pulse" />
                  Analyzing document indices &amp; generating response...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions if chat is fresh */}
          {assistantLogs.length <= 1 && !isThinking && (
            <div className="p-4 border-t border-[#E5E5E5] bg-[#FAFAFA] space-y-2.5">
              <span className="text-[10px] font-bold text-[#666666] uppercase block">Suggested Queries</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(p.text)}
                    className="p-2.5 bg-white hover:bg-[#F5F5F5] border border-[#E5E5E5] hover:border-[#3B82F6] rounded-xl text-left font-semibold text-[#222222] transition-colors cursor-pointer flex items-center gap-2 shadow-inner"
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat input box */}
          <div className="p-4 border-t border-[#E5E5E5] bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery(query);
              }} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={selectedDocId === "all" ? "Ask Decrypt AI anything about your document vault..." : `Ask anything about ${documents.find(d => d.id === selectedDocId)?.name}...`}
                className="flex-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3 text-xs outline-none text-[#222222] focus:ring-1 focus:ring-[#3B82F6] focus:bg-white transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={isThinking || !query.trim()}
                className="bg-[#222222] hover:bg-[#333333] disabled:opacity-50 text-white p-3.5 rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
