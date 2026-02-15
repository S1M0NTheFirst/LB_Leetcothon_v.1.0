import CountdownTimer from "@/components/CountdownTimer";
import RegistrationCounter from "@/components/RegistrationCounter";
import SignInButton from "@/components/SignInButton";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
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
        <section className="mt-32 w-full max-w-4xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-16">
          <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight">About Leetcothon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-yellow-500">The Ultimate CSULB Spring Break Coding Challenge</h3>
              <p className="text-white/60 leading-relaxed">
                Leetcothon is more than just a competition. It&apos;s a week-long intensive coding sprint designed to sharpen your problem-solving skills and prepare you for the toughest technical interviews.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Interview Prep</h4>
                  <p className="text-sm text-white/40">Curated problems from top tech companies to mirror real interview scenarios.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Daily Challenges</h4>
                  <p className="text-sm text-white/40">New problems released every 24 hours to keep the momentum going throughout the break.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Real-time Leaderboards</h4>
                  <p className="text-sm text-white/40">Track your progress and see where you stand among your peers in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-32 text-white/20 text-sm font-medium">
          Powered by S1M0N
        </div>
      </div>
    </main>
  );
}
