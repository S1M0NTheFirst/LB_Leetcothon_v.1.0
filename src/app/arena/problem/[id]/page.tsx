"use client";

import React, { useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { Play, Send, Terminal as TerminalIcon, Code2, BookOpen, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function ProblemSolvingPage() {
  const { id } = useParams();
  const [code, setCode] = useState(`# Starter code for problem ${id}
def solution(nums, target):
    # Write your code here
    pass
`);
  const [terminalOutput, setTerminalOutput] = useState([
    "System: Ready. Press 'Run' to execute test cases.",
  ]);

  const handleRun = () => {
    setTerminalOutput((prev) => [...prev, "> Running tests...", "Result: Success (Mock)"]);
  };

  const handleSubmit = () => {
    setTerminalOutput((prev) => [...prev, "> Submitting solution...", "Status: Accepted (Mock)"]);
  };

  return (
    <div className="h-screen pt-16 bg-[#0a0a0a] overflow-hidden text-white">
      <Group orientation="horizontal">
        {/* Left Panel: Problem Description */}
        <Panel defaultSize={40} minSize={30}>
          <div className="h-full border-r border-white/5 bg-[#111111] flex flex-col">
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-black italic tracking-tighter">
                  1. <span className="text-[#FFC72C]">TWO SUM</span>
                </h1>
                <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest">
                  Easy
                </span>
              </div>

              <div className="space-y-6 text-sm text-white/70 leading-relaxed font-sans">
                <section>
                  <p>
                    Given an array of integers <code className="bg-white/10 px-1 rounded text-[#FFC72C]">nums</code> and an integer <code className="bg-white/10 px-1 rounded text-[#FFC72C]">target</code>, return indices of the two numbers such that they add up to <code className="bg-white/10 px-1 rounded text-[#FFC72C]">target</code>.
                  </p>
                  <p className="mt-4">
                    You may assume that each input would have exactly one solution, and you may not use the same element twice.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-[#FFC72C]" />
                    Examples
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-lg font-mono text-[13px]">
                      <p className="text-white/40 mb-1">Example 1:</p>
                      <p><span className="text-white/40">Input:</span> nums = [2,7,11,15], target = 9</p>
                      <p><span className="text-white/40">Output:</span> [0,1]</p>
                      <p className="text-white/40 mt-1 italic">Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                    </div>
                  </div>
                </section>

                <section>
                   <h3 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-[#FFC72C]" />
                    Constraints
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-white/40 font-mono text-xs">
                    <li>2 ≤ nums.length ≤ 10⁴</li>
                    <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                    <li>-10⁹ ≤ target ≤ 10⁹</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </Panel>

        <Separator className="w-1 bg-[#0a0a0a] hover:bg-[#FFC72C]/30 transition-colors" />

        {/* Right Panel: Editor & Terminal */}
        <Panel defaultSize={60}>
          <Group orientation="vertical">
            {/* Top Right: Editor */}
            <Panel defaultSize={70}>
              <div className="h-full flex flex-col bg-[#111111]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white/40">
                    <Code2 className="w-4 h-4" />
                    SOLUTION.PY
                  </div>
                  <div className="text-[10px] font-mono text-[#FFC72C] uppercase tracking-widest">
                    Python 3
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    defaultLanguage="python"
                    value={code}
                    onChange={(val) => setCode(val || "")}
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
              </div>
            </Panel>

            <Separator className="h-1 bg-[#0a0a0a] hover:bg-[#FFC72C]/30 transition-colors" />

            {/* Bottom Right: Terminal */}
            <Panel defaultSize={30}>
              <div className="h-full bg-[#0d0d0d] flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white/40">
                    <TerminalIcon className="w-4 h-4" />
                    TERMINAL
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleRun}
                      className="flex items-center gap-2 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/10 active:scale-95"
                    >
                      <Play className="w-3 h-3" />
                      RUN
                    </button>
                    <button 
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-3 py-1 rounded bg-[#FFC72C] text-black text-xs font-black transition-all hover:bg-[#FFC72C]/90 active:scale-95 shadow-[0_0_15px_rgba(255,199,44,0.2)]"
                    >
                      <Send className="w-3 h-3" />
                      SUBMIT
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-green-400 space-y-1 custom-scrollbar">
                  {terminalOutput.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 199, 44, 0.3);
        }
      `}</style>
    </div>
  );
}
