import { Users } from "lucide-react";

export default function LiveStats() {
  // Hardcoded for now
  const registeredUsers = 124;

  return (
    <div className="flex items-center gap-4 p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20 mt-12">
      <div className="p-3 bg-blue-500 rounded-xl">
        <Users className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-blue-400 uppercase tracking-wider">Registered Participants</p>
        <p className="text-3xl font-bold">{registeredUsers}</p>
      </div>
    </div>
  );
}
