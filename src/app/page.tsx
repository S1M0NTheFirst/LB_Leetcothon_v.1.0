import CountdownTimer from "@/components/CountdownTimer";
import RegistrationCounter from "@/components/RegistrationCounter";
import SignInButton from "@/components/SignInButton";
import Logo from "@/components/Logo";
import * as motion from "framer-motion/client";
import Playbook from "@/components/Playbook";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center text-center">
        {/* Hero Section */}
        <div className="space-y-6 flex flex-col items-center">
          <Logo className="w-24 h-24 mb-4" />
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            LB Leetcothon
          </h1>
          
          {/* Terminal Schedule Line */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg font-mono text-sm md:text-base mb-2">
            <span className="text-white/30">$</span>
            <span className="text-green-400">Monday, March 30 00:00 am - Sunday, April 5 8:00 pm</span>
          </div>

          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto font-medium">
            Join the ultimate CSULB leetcoding challenge for SpringBreak. 
            Level up your skills and compete for the 🔥FAANG+.
          </p>
        </div>

        {/* Countdown Section */}
        <div className="mt-20 w-full max-w-3xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4">Leetcothon Starts In</h2>
          <CountdownTimer targetDate="2026-03-30T00:00:00" />
        </div>

        {/* Stats Section with Badge */}
        <div className="relative w-full">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
              ✨ Beginner Friendly
            </span>
          </div>
          <RegistrationCounter />
        </div>
        
        {/* About Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.8, 
            ease: [0, 0.71, 0.2, 1.01],
            scale: {
              type: "spring",
              damping: 12,
              stiffness: 100,
              restDelta: 0.001
            }
          }}
          className="mt-32 w-full max-w-4xl relative"
        >
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

          {/* Terminal Window Decoration */}
          <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 border-b border-white/10 px-6 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
              </div>
              <span className="text-xs font-mono text-white/20 ml-2">about_leetcothon.md</span>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="p-8 md:p-16 text-center"
            >
              <h2 className="text-3xl md:text-5xl font-black mb-12 tracking-tight text-yellow-500">
                Why Join Leetcothon?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-mono text-white">
                    <span className="text-blue-400">void</span> prepareForSuccess()
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Leetcothon is more than just a competition—it’s a collaborative coding sprint designed to get you hired. Whether you are aiming for your first internship or just starting with Data Structures, you won't be doing it alone. Join a community of motivated students solving problems together, keeping each other accountable, and mastering the skills needed for technical interviews
                  </p>
                </div>
                
                <div className="space-y-8">
                  <div className="flex gap-4 group">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h4 className="font-mono font-bold mb-1 text-white">
                        <span className="text-purple-400">class</span> InterviewPrep
                      </h4>
                      <p className="text-sm text-gray-400">Curated problems from top tech companies to mirror real interview scenarios.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div>
                      <h4 className="font-mono font-bold mb-1 text-white">
                        <span className="text-purple-400">async</span> dailyChallenges()
                      </h4>
                      <p className="text-sm text-gray-400">New problems released every 24 hours to keep the momentum going throughout the break.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <h4 className="font-mono font-bold mb-1 text-white">
                        <span className="text-purple-400">get</span> Leaderboard()
                      </h4>
                      <p className="text-sm text-gray-400">Track your progress and see where you stand among your peers in real-time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-32" />

        {/* Playbook Section */}
        <Playbook />

        <div className="mt-32 text-white/20 text-sm font-medium">
          Powered by S1M0N
        </div>
      </div>
    </main>
  );
}
