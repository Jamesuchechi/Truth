import { requireAdmin } from "@/lib/auth-utils"
import { Shield, Zap, Terminal, Activity, Users, ShieldAlert } from "lucide-react"

export default async function AdminPage() {
  const user = await requireAdmin()

  return (
    <main className="min-h-screen bg-truth-bg text-truth-textLight pt-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-truth-midGray pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-mono text-xs text-truth-accentRed uppercase tracking-[0.3em]">
              <Shield className="w-4 h-4" /> Root Protocol Active
            </div>
            <h1 className="font-bitter text-6xl font-black uppercase tracking-tighter">
              Admin Interface
            </h1>
          </div>
          <div className="p-4 bg-truth-nearBlack border border-truth-midGray font-mono text-[10px] uppercase tracking-widest text-truth-textGray">
            Operator: <span className="text-truth-accentGreen">{user.username}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[8px_8px_0px_rgba(255,51,102,0.1)] hover:border-truth-accentRed transition-all group">
             <Activity className="w-8 h-8 text-truth-accentRed mb-6 group-hover:animate-pulse" />
             <h3 className="font-bitter text-xl font-black uppercase mb-2">Network Load</h3>
             <p className="font-mono text-4xl text-truth-textLight">98.4%</p>
           </div>
           <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[8px_8px_0px_rgba(255,51,102,0.1)] hover:border-truth-accentRed transition-all group">
             <Users className="w-8 h-8 text-truth-accentRed mb-6" />
             <h3 className="font-bitter text-xl font-black uppercase mb-2">Total Souls</h3>
             <p className="font-mono text-4xl text-truth-textLight">1,204</p>
           </div>
           <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[8px_8px_0px_rgba(255,51,102,0.1)] hover:border-truth-accentRed transition-all group">
             <Terminal className="w-8 h-8 text-truth-accentRed mb-6" />
             <h3 className="font-bitter text-xl font-black uppercase mb-2">Active Signals</h3>
             <p className="font-mono text-4xl text-truth-textLight">459</p>
           </div>
           <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[8px_8px_0px_rgba(255,51,102,0.1)] hover:border-truth-accentRed transition-all group">
             <ShieldAlert className="w-8 h-8 text-truth-accentRed mb-6" />
             <h3 className="font-bitter text-xl font-black uppercase mb-2">System Health</h3>
             <p className="font-mono text-4xl text-truth-accentGreen">OPTIMAL</p>
           </div>
        </div>

        <div className="p-20 border-2 border-dashed border-truth-midGray rounded-lg text-center flex flex-col items-center gap-6">
          <Zap className="w-12 h-12 text-truth-textGray opacity-20" />
          <h2 className="font-bitter text-2xl font-black text-truth-textGray uppercase">Command Modules Charging</h2>
          <p className="font-mono text-sm text-truth-textGray max-w-md uppercase tracking-widest">
            Detailed network oversight and identity banning protocols are currently being synchronized for Phase 3.
          </p>
        </div>
      </div>
    </main>
  )
}
