"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  Play, Send, Terminal as TerminalIcon, Code2, BookOpen, 
  AlertCircle, X, Loader2, Lock, Bookmark, Settings, 
  RotateCcw, Maximize2, CheckSquare, Trophy, Cpu, Zap,
  AlertTriangle, ArrowLeft, CheckCircle2, History, ChevronRight, ChevronDown
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { id: "python", name: "Python", judge0Id: 71, editorLang: "python" },
  { id: "cpp", name: "C++", judge0Id: 54, editorLang: "cpp" },
  { id: "java", name: "Java", judge0Id: 62, editorLang: "java" },
  { id: "c", name: "C", judge0Id: 50, editorLang: "c" },
];

const STARTER_CODE: Record<string, string> = {
  python: `class Solution:\n    def solve(self, ...):\n        # Write your code here\n        pass`,
  cpp: `class Solution {\npublic:\n    void solve() {\n        \n    }\n};`,
  java: `class Solution {\n    public void solve() {\n        \n    }\n}`,
  c: `void solve() {\n\n}`,
};

export default function ProblemSolvingPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [lastResult, setLastResult] = useState<any>(null);
  const [resultType, setResultType] = useState<'run' | 'submit' | null>(null);
  const [activeTab, setActiveTab] = useState<'testcase' | 'result' | 'submissions'>('testcase');
  const [activeCase, setActiveCase] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastPoints, setToastPoints] = useState(0);
  const [toastType, setToastType] = useState<'success' | 'violation'>('success');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  // Fetch User Profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!session?.user?.email,
  });

  const isSolved = profile?.solved_problems?.includes(id as string);

  // Fetch Problem Data
  const { data: problem, isLoading: isProblemLoading } = useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/problems/${id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Problem not found");
      }
      return res.json();
    },
    retry: false,
  });

  // Fetch Submission History
  const { data: submissions, isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ["submissions", id, session?.user?.email],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/execute/submissions/${id}?user_email=${session?.user?.email}`);
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return res.json();
    },
    enabled: !!session?.user?.email && activeTab === 'submissions',
  });

  // Persistence: Load code from localStorage
  useEffect(() => {
    if (!id) return;
    const storageKey = `draft_code_${id}_${selectedLanguage.id}`;
    const savedCode = localStorage.getItem(storageKey);
    
    if (savedCode) {
      setCode(savedCode);
    } else if (problem?.starter_code?.[selectedLanguage.id]) {
      setCode(problem.starter_code[selectedLanguage.id]);
    } else {
      setCode(STARTER_CODE[selectedLanguage.id] || "");
    }
  }, [id, selectedLanguage.id, problem]);

  const resetCode = () => {
    if (confirm("Reset to starter code? Your current progress will be lost.")) {
      const defaultCode = problem?.starter_code?.[selectedLanguage.id] || STARTER_CODE[selectedLanguage.id];
      setCode(defaultCode);
      localStorage.setItem(`draft_code_${id}_${selectedLanguage.id}`, defaultCode);
    }
  };

  const handleEditorChange = (val: string | undefined) => {
    const newCode = val || "";
    setCode(newCode);
    if (id) {
      localStorage.setItem(`draft_code_${id}_${selectedLanguage.id}`, newCode);
    }
  };

  const handleEditorMount = (editor: any) => {
    editor.onDidPaste((e: any) => {
      // Immediately undo the paste
      editor.trigger('keyboard', 'undo', null);
      
      // Notify user
      setToastPoints(0);
      setToastType('violation');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  const runCodeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/execute/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to run code");
      return res.json();
    },
    onSuccess: (data) => {
      setLastResult(data);
      setResultType('run');
      setActiveTab('result');
    },
  });

  const submitCodeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/execute/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit code");
      return res.json();
    },
    onSuccess: (data) => {
      setLastResult(data);
      setResultType('submit');
      setActiveTab('result');
      queryClient.invalidateQueries({ queryKey: ["submissions", id] });
      
      if (data.points_awarded) {
        setToastPoints(data.awarded_amount);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
      
      if (data.status?.description === "Accepted") {
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      }
    },
  });

  const handleRun = () => {
    runCodeMutation.mutate({
      code,
      language_id: selectedLanguage.judge0Id,
      test_cases: problem?.public_test_cases,
      problem_id: id,
    });
  };

  const handleSubmit = () => {
    submitCodeMutation.mutate({
      code,
      language_id: selectedLanguage.judge0Id,
      problem_id: id,
      user_email: session?.user?.email,
    });
  };

  const isPending = runCodeMutation.isPending || submitCodeMutation.isPending;

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isProblemLoading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#FFC72C] animate-spin" />
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Initialising Sector...</p>
        </div>
      </div>
    );
  }

  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">{children}</div>;
  };

  const ContentPanel = ({ children, className }: any) => {
    return <div className={className}>{children}</div>;
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      <nav className="h-14 border-b border-white/5 bg-[#0d0d0d] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/arena')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-[#FFC72C] transition-colors" />
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#FFC72C] uppercase tracking-widest bg-[#FFC72C]/10 px-2 py-0.5 rounded border border-[#FFC72C]/20">
              {problem?.difficulty}
            </span>
            <h1 className="font-black text-sm uppercase italic tracking-tight">{problem?.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Trophy className="w-3 h-3 text-[#FFC72C]" />
            <span className="text-[10px] font-mono font-bold text-white/60">{profile?.points || 0} pts</span>
          </div>
          {isSolved && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-tighter">Accepted</span>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 overflow-hidden">
        <LayoutWrapper>
          <ContentPanel className="w-full md:w-[40%] h-full flex flex-col bg-[#0d0d0d] border-r border-white/5">
            <div className="h-full flex flex-col">
              <div className="flex items-center px-4 border-b border-white/5 bg-white/[0.02]">
                <button className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#FFC72C] border-b-2 border-[#FFC72C] flex items-center gap-2">
                  <BookOpen className="w-3 h-3" />
                  Description
                </button>
                <button className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  Editorial
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="prose prose-invert prose-zinc max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: problem?.description || "" }} 
                    className="text-white/70 text-sm leading-relaxed font-medium selection:bg-[#FFC72C]/30"
                  />
                  
                  {problem?.public_test_cases && (
                    <section className="mt-12 space-y-8 border-t border-white/5 pt-8">
                      <h4 className="text-xs font-mono uppercase tracking-[0.3em] text-white/30">Intelligence Data</h4>
                      <div className="space-y-6">
                        {problem.public_test_cases.slice(0, 2).map((tc: any, i: number) => (
                          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">Sample #{i + 1}</span>
                              <CheckSquare className="w-3 h-3 text-white/10" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[9px] font-mono uppercase text-white/30">Input</label>
                                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 font-mono text-xs text-white/60">{tc.input}</div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-mono uppercase text-white/30">Target Output</label>
                                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 font-mono text-xs text-[#FFC72C]/60">{tc.expected}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </ContentPanel>

          <ContentPanel className="w-full md:w-[60%] h-full flex flex-col overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 flex flex-col bg-[#111111]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLanguage.id}
                      onChange={(e) => {
                        const lang = LANGUAGES.find(l => l.id === e.target.value);
                        if (lang) setSelectedLanguage(lang);
                      }}
                      className="bg-transparent text-white/80 text-xs font-medium focus:outline-none cursor-pointer hover:text-white transition-colors"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.id} value={lang.id} className="bg-[#1a1a1a]">
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/40">
                      <Lock className="w-3 h-3" />
                      <span>Auto</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/40">
                    <button className="hover:text-white transition-colors" title="Bookmark">
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="hover:text-white transition-colors" title="Settings">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={resetCode} 
                      className="hover:text-white transition-colors" 
                      title="Reset to default code"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="hover:text-white transition-colors" title="Maximize">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <Editor
                    key={`${id}-${selectedLanguage.id}`}
                    height="100%"
                    theme="vs-dark"
                    language={selectedLanguage.editorLang}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: "on",
                      padding: { top: 16 },
                      fontFamily: "var(--font-mono)",
                      wordWrap: "on",
                      wrappingIndent: "indent"
                    }}
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.02]">
                  <div className="text-[11px] text-white/30 font-mono">
                    Ln 1, Col 1 | Saved
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleRun}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333] text-white/90 text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
                    >
                      {runCodeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                      Run
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#FFC72C] hover:bg-[#FFC72C]/90 text-black text-xs font-black transition-all disabled:opacity-50 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                    >
                      {submitCodeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin text-black" /> : <Send className="w-3 h-3 fill-current" />}
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-[30%] bg-[#0d0d0d] flex flex-col border-t border-white/5 overflow-hidden">
                <div className="flex items-center px-4 border-b border-white/5 bg-white/[0.02]">
                  <button 
                    onClick={() => setActiveTab('testcase')}
                    className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                      activeTab === 'testcase' ? 'border-[#FFC72C] text-[#FFC72C]' : 'border-transparent text-white/40 hover:text-white/60'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3" />
                    Testcase
                  </button>
                  <button 
                    onClick={() => setActiveTab('result')}
                    className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                      activeTab === 'result' ? 'border-[#FFC72C] text-[#FFC72C]' : 'border-transparent text-white/40 hover:text-white/60'
                    }`}
                  >
                    <TerminalIcon className="w-3 h-3" />
                    Test Result
                  </button>
                  <button 
                    onClick={() => setActiveTab('submissions')}
                    className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                      activeTab === 'submissions' ? 'border-[#FFC72C] text-[#FFC72C]' : 'border-transparent text-white/40 hover:text-white/60'
                    }`}
                  >
                    <History className="w-3 h-3" />
                    Submissions
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {activeTab === 'submissions' ? (
                      <div className="space-y-4">
                          {isSubmissionsLoading ? (
                              <div className="flex items-center justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
                          ) : !submissions || submissions?.length === 0 ? (
                              <div className="text-center p-12 text-white/20 text-xs font-mono">No submissions yet.</div>
                          ) : submissions?.map((sub: any) => (
                              <div key={sub.submission_id} className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02]">
                                  <div 
                                      onClick={() => setExpandedSubmission(expandedSubmission === sub.submission_id ? null : sub.submission_id)}
                                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                                  >
                                      <div className="flex items-center gap-4">
                                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${sub.status === 'Accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                              {sub.status}
                                          </span>
                                          <span className="text-[10px] text-white/40 font-mono">{new Date(sub.timestamp).toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center gap-6">
                                          <div className="hidden sm:flex items-center gap-4 text-[10px] text-white/20 font-mono">
                                              <span>{sub.language}</span>
                                              <span>{sub.runtime_ms}ms</span>
                                              <span>{sub.memory_mb}MB</span>
                                          </div>
                                          {expandedSubmission === sub.submission_id ? <ChevronDown className="w-4 h-4 text-white/20" /> : <ChevronRight className="w-4 h-4 text-white/20" />}
                                      </div>
                                  </div>
                                  {expandedSubmission === sub.submission_id && (
                                      <div className="p-4 bg-black/40 border-t border-white/5">
                                          <pre className="text-[11px] font-mono text-white/60 overflow-x-auto whitespace-pre">
                                              {sub.code}
                                          </pre>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  ) : activeTab === 'result' && lastResult ? (
                    lastResult.error ? (
                      <div className="space-y-4 border border-red-500/20 bg-red-500/5 p-4 rounded-xl">
                         <div className="flex items-center gap-2 text-red-500">
                           <AlertTriangle className="w-5 h-5" />
                           <span className="font-bold uppercase tracking-tighter italic">Backend Error</span>
                         </div>
                         <p className="text-white/60 font-mono text-xs">{lastResult.error}</p>
                      </div>
                    ) : resultType === 'submit' && lastResult.status?.description === "Accepted" ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-500/20 p-3 rounded-2xl">
                            <Trophy className="w-8 h-8 text-green-500" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-green-500 uppercase tracking-tighter">Accepted</h3>
                            <p className="text-xs text-white/40 font-mono">Solution submitted successfully</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1 relative overflow-hidden group">
                            {lastResult.is_optimized && (
                              <div className="absolute top-0 right-0 bg-[#FFC72C] text-black text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase italic z-10 shadow-lg">
                                Efficiency 2x
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                              <Zap className={`w-3 h-3 ${lastResult.is_optimized ? 'text-[#FFC72C] animate-pulse' : 'text-yellow-500'}`} />
                              Runtime
                            </div>
                            <div className="text-xl font-bold text-white">{lastResult.runtime_ms?.toFixed(1) || lastResult.time} ms</div>
                            <div className="text-[10px] text-green-400 font-mono">Beats {lastResult.runtime_beats || (lastResult.is_optimized ? "99.9" : "85.2")}%</div>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1 relative overflow-hidden group">
                             {lastResult.is_optimized && (
                              <div className="absolute top-0 right-0 bg-[#FFC72C] text-black text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase italic z-10 shadow-lg">
                                Efficiency 2x
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                              <Cpu className={`w-3 h-3 ${lastResult.is_optimized ? 'text-[#FFC72C] animate-pulse' : 'text-blue-500'}`} />
                              Memory
                            </div>
                            <div className="text-xl font-bold text-white">{lastResult.memory_mb?.toFixed(2) || "0.0"} MB</div>
                            <div className="text-[10px] text-green-400 font-mono">Beats {lastResult.memory_beats || (lastResult.is_optimized ? "99.9" : "82.4")}%</div>
                          </div>
                        </div>

                        {lastResult.points_awarded && (
                          <div className={`p-4 rounded-xl flex items-center justify-between relative overflow-hidden ${lastResult.is_optimized ? 'bg-[#FFC72C]/20 border border-[#FFC72C]/40 shadow-[0_0_20px_rgba(255,199,44,0.1)]' : 'bg-[#FFC72C]/10 border border-[#FFC72C]/20'}`}>
                            {lastResult.is_optimized && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            )}
                            <div className="flex items-center gap-3">
                              <Trophy className={`w-5 h-5 ${lastResult.is_optimized ? 'text-white' : 'text-[#FFC72C]'}`} />
                              <div className="flex flex-col">
                                  <span className={`text-sm font-black uppercase tracking-tight ${lastResult.is_optimized ? 'text-white' : 'text-[#FFC72C]'}`}>
                                      {lastResult.is_optimized ? 'Optimization Multiplier Applied!' : 'First Solve Bonus'}
                                  </span>
                                  {lastResult.ironman_awarded && (
                                      <span className="text-[10px] font-black text-white uppercase italic animate-bounce">
                                          Ironman Consistency Bonus +500 XP
                                      </span>
                                  )}
                              </div>
                            </div>
                            <span className={`text-lg font-black italic ${lastResult.is_optimized ? 'text-white' : 'text-[#FFC72C]'}`}>
                              +{lastResult.awarded_amount} XP
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-baseline gap-3">
                          <h3 className={`text-xl font-bold ${lastResult.status?.description === "Accepted" ? "text-green-500" : "text-red-500"}`}>
                            {lastResult.status?.description}
                          </h3>
                          <span className="text-xs text-white/30 font-mono">
                            Runtime: {lastResult.runtime_ms || lastResult.time || "0"} ms
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {(problem?.public_test_cases || [0, 1, 2]).map((_: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => setActiveCase(i)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 ${
                                activeCase === i 
                                  ? 'bg-white/10 text-white border border-white/10' 
                                  : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/[0.07]'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${lastResult.status?.description === "Accepted" ? 'bg-green-500' : 'bg-red-500'}`} />
                              Case {i + 1}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Input</label>
                            <div className="bg-[#262626] p-4 rounded-xl border border-white/5 font-mono text-xs text-white/80 whitespace-pre-wrap">
                              {problem?.public_test_cases?.[activeCase]?.input || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Output</label>
                            <div className="bg-[#262626]/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-green-400/80 whitespace-pre-wrap">
                              {lastResult.stdout || lastResult.message || "No output produced."}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    activeTab === 'testcase' ? (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                          {(problem?.public_test_cases || [0, 1, 2]).map((tc: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => setActiveCase(i)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                activeCase === i ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40'
                              }`}
                            >
                              Case {i + 1}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Input</label>
                          <div className="bg-[#262626] p-4 rounded-xl border border-white/5 font-mono text-xs text-white/80 whitespace-pre-wrap">
                            {problem?.public_test_cases?.[activeCase]?.input || "Loading cases..."}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-2">
                        <Play className="w-8 h-8" />
                        <p className="text-xs font-mono">Run your code to see results</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </ContentPanel>
        </LayoutWrapper>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 ${
              toastType === 'violation' 
                ? 'bg-red-500 text-white border-white/20 shadow-red-500/30' 
                : 'bg-[#FFC72C] text-black border-white/20 shadow-[0_0_50px_rgba(255,199,44,0.3)]'
            }`}
          >
            <div className={`${toastType === 'violation' ? 'bg-black/20' : 'bg-black/10'} p-2 rounded-full`}>
              {toastType === 'violation' ? <AlertTriangle className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${toastType === 'violation' ? 'text-white/80' : 'opacity-60'}`}>
                {toastType === 'violation' ? 'SECURITY ALERT' : 'Objective Secured'}
              </p>
              <p className="text-xl font-black italic tracking-tighter">
                {toastType === 'violation' ? 'PASTE PROTOCOL VIOLATION' : `+${toastPoints} XP EARNED`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 199, 44, 0.3); }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
