"use client";

import React, { useState, useEffect } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { 
  Play, Send, Terminal as TerminalIcon, Code2, BookOpen, 
  AlertCircle, X, Loader2, Lock, Bookmark, Settings, 
  RotateCcw, Maximize2, CheckSquare, Trophy, Cpu, Zap
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

const LANGUAGES = [
  { id: "python", name: "Python", judge0Id: 71, editorLang: "python" },
];

const STARTER_CODE: Record<string, string> = {
  python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass`,
};

export default function ProblemSolvingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [lastResult, setLastResult] = useState<any>(null);
  const [resultType, setResultType] = useState<'run' | 'submit' | null>(null);
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
  const [activeCase, setActiveCase] = useState(0);

  // Fetch Problem Data
  const { data: problem, isLoading: isProblemLoading } = useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";
      const res = await fetch(`${baseUrl}/api/problems/${id}`);
      if (!res.ok) throw new Error("Problem not found");
      return res.json();
    },
  });

  // Persistence: Load code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(`draft_code_${id}_${selectedLanguage.id}`);
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
    localStorage.setItem(`draft_code_${id}_${selectedLanguage.id}`, newCode);
  };

  const runCodeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";
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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";
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
    },
  });

  const handleRun = () => {
    runCodeMutation.mutate({
      code,
      language_id: selectedLanguage.judge0Id,
      test_cases: problem?.public_test_cases || [],
      problem_id: id as string,
    });
  };

  const handleSubmit = () => {
    submitCodeMutation.mutate({
      problem_id: id as string,
      code,
      language_id: selectedLanguage.judge0Id,
    });
  };

  const isPending = runCodeMutation.isPending || submitCodeMutation.isPending;

  if (isProblemLoading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFC72C]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0a0a0a] overflow-hidden text-white flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#111111]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black italic tracking-tighter uppercase">
            Problem <span className="text-[#FFC72C]">{problem?.id || id}</span>
          </h1>
          <div className="h-4 w-px bg-white/10" />
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${
            problem?.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border-green-500/20" :
            problem?.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
            "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
            {problem?.difficulty || "Easy"}
          </span>
        </div>
        
        <button 
          onClick={() => router.push("/arena")}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10 flex items-center gap-2 text-xs font-bold uppercase tracking-tighter active:scale-95"
        >
          <X className="w-4 h-4" />
          Exit Arena
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full border-r border-white/5 bg-[#111111] flex flex-col">
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-6 text-sm text-white/70 leading-relaxed font-sans">
                  <section>
                    <h2 className="text-lg font-bold text-white mb-2">{problem?.title || "Loading..."}</h2>
                    <div className="prose prose-invert prose-sm max-w-none">
                      {problem?.description || "Loading problem description..."}
                    </div>
                  </section>

                  {problem?.public_test_cases?.length > 0 && (
                    <section>
                      <h3 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-[#FFC72C]" />
                        Examples
                      </h3>
                      <div className="space-y-4">
                        {problem.public_test_cases.map((tc: any, i: number) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-lg font-mono text-[13px]">
                            <p className="text-white/40 mb-1">Example {i+1}:</p>
                            <p><span className="text-white/40">Input:</span> {tc.input}</p>
                            <p><span className="text-white/40">Output:</span> {tc.expected}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          <Separator className="w-1 bg-[#0a0a0a] hover:bg-[#FFC72C]/30 transition-colors" />

          <Panel defaultSize={60}>
            <Group orientation="vertical">
              <Panel defaultSize={70}>
                <div className="h-full flex flex-col bg-[#111111]">
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
                      <Bookmark className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                      <Settings className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                      <RotateCcw onClick={resetCode} className="w-4 h-4 hover:text-white cursor-pointer transition-colors" title="Reset to default code" />
                      <Maximize2 className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      theme="vs-dark"
                      language={selectedLanguage.editorLang}
                      value={code}
                      onChange={handleEditorChange}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        padding: { top: 16 },
                        fontFamily: "var(--font-mono)",
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
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#FFC72C] hover:bg-[#FFC72C]/90 text-black text-xs font-black transition-all disabled:opacity-50 active:scale-95 shadow-[0_0_15px_rgba(255,199,44,0.1)]"
                      >
                        {submitCodeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin text-black" /> : <Send className="w-3 h-3 fill-current" />}
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </Panel>

              <Separator className="h-1 bg-[#0a0a0a] hover:bg-[#FFC72C]/30 transition-colors" />

              <Panel defaultSize={30}>
                <div className="h-full bg-[#0d0d0d] flex flex-col">
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
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {activeTab === 'result' && lastResult ? (
                      resultType === 'submit' && lastResult.status?.description === "Accepted" ? (
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
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                Runtime
                              </div>
                              <div className="text-xl font-bold text-white">{lastResult.runtime_ms || lastResult.time} ms</div>
                              <div className="text-[10px] text-green-400 font-mono">Beats {lastResult.runtime_beats}%</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                <Cpu className="w-3 h-3 text-blue-500" />
                                Memory
                              </div>
                              <div className="text-xl font-bold text-white">{lastResult.memory_mb || "0.0"} MB</div>
                              <div className="text-[10px] text-green-400 font-mono">Beats {lastResult.memory_beats}%</div>
                            </div>
                          </div>
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
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 199, 44, 0.3); }
      `}</style>
    </div>
  );
}
