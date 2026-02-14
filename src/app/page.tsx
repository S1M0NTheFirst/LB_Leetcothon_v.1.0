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
            LB Leetcodethon
          </h1>
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto font-medium">
            Join the ultimate CSULB leetcoding challenge for SpringBreak. 
            Level up your skills and compete for the 🔥FAANG+.
          </p>
        </div>

        {/* Countdown Section */}
        <div className="mt-20 w-full max-w-3xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4">Leetcodethon Starts In</h2>
          <CountdownTimer targetDate="2026-03-30T00:00:00" />
        </div>

        {/* Stats Section */}
        <RegistrationCounter />
        
        <div className="mt-32 text-white/20 text-sm font-medium">
          Powered by S1M0N
        </div>
      </div>
    </main>
  );
}
