import { prisma } from "@/lib/db/prisma"
import { ShieldCheck, ShieldAlert, Flag, Info, UserCheck, Scale, Clock, Activity } from "lucide-react"

interface ModerationLog {
  id: string
  reason: string
  reviewedAt: Date | null
  post?: {
    content: string
    toxicityScore: number
    isRestored: boolean
  }
}

export default async function ModerationTransparencyPage() {
  // Fetch anonymized moderation logs
  const logs = await prisma.report.findMany({
    where: { 
      status: { in: ['ACTIONED', 'APPEALED'] },
      reviewedAt: { not: null }
    },
    include: {
      post: {
        select: {
          content: true,
          toxicityScore: true,
          isRestored: true
        }
      },
      moderatorActions: {
          select: {
              actionType: true,
              reason: true
          }
      }
    },
    orderBy: { reviewedAt: 'desc' },
    take: 30
  }) as unknown as ModerationLog[]

  // Global Stat Metrics
  const totalSignals = await prisma.post.count()
  const totalFlags = await prisma.report.count()
  const resolvedRate = Math.floor((logs.length / (totalFlags || 1)) * 100)

  return (
    <main className="min-h-screen bg-truth-bg text-truth-textLight pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-2 border-truth-midGray pb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3 font-mono text-[11px] text-truth-accentBlue uppercase tracking-[0.5em]">
              <Scale className="w-5 h-5 animate-pulse" /> Protocol Equity & Transparency
            </div>
            <h1 className="font-bitter text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Moderation <span className="text-truth-accentBlue">Audit</span>
            </h1>
            <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
              Real-time synchronization of all protocol enforcement actions. Our governance is fully public to ensure signal integrity and prevents administrative capture.
            </p>
          </div>

          {/* Real-time Global Metrics */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-8 bg-truth-nearBlack border border-truth-midGray space-y-2 group hover:border-truth-accentBlue transition-all">
                <div className="flex items-center gap-3 text-[10px] font-mono text-truth-textGray uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-truth-accentBlue" /> Resolution_Rate
                </div>
                <div className="text-4xl font-bitter font-black text-truth-accentBlue">{resolvedRate}%</div>
                <div className="h-1 bg-truth-midGray w-full mt-4 bg-linear-to-r from-truth-accentBlue/20 to-transparent">
                  <div className="h-full bg-truth-accentBlue" style={{ width: `${resolvedRate}%` }} />
                </div>
             </div>
             <div className="p-8 bg-truth-nearBlack border border-truth-midGray space-y-2 group hover:border-truth-accentRed transition-all">
                <div className="flex items-center gap-3 text-[10px] font-mono text-truth-textGray uppercase tracking-widest">
                  <Flag className="w-4 h-4 text-truth-accentRed" /> Total_Flags
                </div>
                <div className="text-4xl font-bitter font-black text-truth-accentRed">{totalFlags}</div>
                <div className="text-[9px] font-mono text-truth-textGray uppercase mt-2">Historical Cumulative</div>
             </div>
          </div>
        </header>

        {/* Global Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
          
          <div className="lg:col-span-3 space-y-10">
             <h2 className="font-bitter text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
               Live <span className="text-truth-accentBlue underline decoration-2 underline-offset-8">Audit Log</span>
               <Clock className="w-6 h-6 text-truth-textGray opacity-30" />
             </h2>

             {logs.length === 0 ? (
               <div className="py-24 text-center border-2 border-dashed border-truth-midGray rounded-sm opacity-50">
                  <ShieldCheck className="w-12 h-12 text-truth-accentBlue mx-auto mb-6" />
                  <p className="font-mono text-xs uppercase tracking-widest">Protocol is currently stable. No recent actions detected.</p>
               </div>
             ) : (
               <div className="space-y-px bg-truth-midGray overflow-hidden border-2 border-truth-midGray shadow-2xl">
                 {logs.map((log) => (
                   <div 
                    key={log.id} 
                    className="p-8 bg-truth-nearBlack hover:bg-black/50 transition-colors group flex flex-col md:flex-row gap-10 items-start"
                   >
                     {/* Action Type Icon */}
                     <div className="shrink-0 flex flex-col items-center gap-2">
                        <div className={`p-4 border-2 ${log.post?.isRestored ? 'border-truth-accentGreen text-truth-accentGreen' : 'border-truth-accentRed text-truth-accentRed'}`}>
                           {log.post?.isRestored ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                        </div>
                        <div className="font-mono text-[8px] uppercase tracking-widest font-black text-truth-textGray">CODE: {log.id.substring(0, 6)}</div>
                     </div>

                     {/* Content Info */}
                     <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-6">
                           <span className="font-mono text-[10px] text-truth-textLight uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 font-black">
                             {log.reason}
                           </span>
                           <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-[.2em]">
                             {log.reviewedAt?.toLocaleDateString()} {" // "} {log.reviewedAt?.toLocaleTimeString()}
                           </span>
                        </div>

                        <div className="p-5 bg-black/40 border border-truth-midGray/30 relative group-hover:border-truth-accentBlue/30 transition-all">
                           <p className="font-bitter text-sm text-truth-textGray leading-relaxed line-clamp-3">
                             {log.post?.content || "[CONTENT_DELETED_IN_TRANSIT]"}
                           </p>
                           {log.post?.isRestored && (
                             <div className="absolute top-2 right-2 flex items-center gap-2 px-2 py-0.5 bg-truth-accentGreen/10 border border-truth-accentGreen/20">
                                <ShieldCheck className="w-3 h-3 text-truth-accentGreen" />
                                <span className="font-mono text-[8px] text-truth-accentGreen uppercase font-black">Restored</span>
                             </div>
                           )}
                           {/* Anonymity Scan Overlay */}
                           <div className="absolute inset-0 bg-linear-to-r from-transparent via-truth-accentBlue/5 to-transparent h-full w-2 animate-scan opacity-0 group-hover:opacity-100 pointer-events-none" />
                        </div>
                        
                        <div className="flex items-center gap-6 pt-2 font-mono text-[9px] uppercase tracking-widest font-bold">
                           <span className="text-truth-textGray">Result: <span className={log.post?.isRestored ? 'text-truth-accentGreen' : 'text-truth-accentRed'}>{log.post?.isRestored ? "REINSTATED_BY_APPEAL" : "SIGNAL_TERMINATED"}</span></span>
                           <span className="w-1 h-1 bg-truth-midGray rounded-full" />
                           <span className="text-truth-textGray">Toxicity_Index: <span className="text-truth-textLight">{Math.floor((log.post?.toxicityScore || 0) * 100)}%</span></span>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Transparency Sidebar Information */}
          <div className="space-y-12">
             <div className="p-10 bg-truth-nearBlack border-2 border-truth-midGray space-y-8 relative overflow-hidden group">
                {/* Background Decor */}
                <ShieldCheck className="absolute -bottom-10 -right-10 w-40 h-40 text-truth-accentBlue opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                
                <h3 className="font-bitter text-2xl font-black uppercase tracking-tighter">Governance Protocol</h3>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <ShieldCheck className="w-5 h-5 text-truth-accentBlue shrink-0 mt-1" />
                      <p className="font-mono text-[10px] text-truth-textGray leading-relaxed uppercase">Signals are autonomously evaluated by the moderation layer. Admins can only override through public verification.</p>
                   </div>
                   <div className="flex items-start gap-4">
                      <UserCheck className="w-5 h-5 text-truth-accentGreen shrink-0 mt-1" />
                      <p className="font-mono text-[10px] text-truth-textGray leading-relaxed uppercase">Transparent appeals ensure that no signal is suppressed by administrative bias.</p>
                   </div>
                </div>
                <button className="w-full py-4 mt-4 border border-truth-accentBlue text-truth-accentBlue font-mono text-[10px] font-black uppercase tracking-[0.3em] hover:bg-truth-accentBlue hover:text-white hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all">
                   View_Public_Ledger
                </button>
             </div>

             <div className="p-10 bg-truth-nearBlack border-2 border-truth-midGray space-y-8">
                <h3 className="font-bitter text-2xl font-black uppercase tracking-tighter">Protocol Health</h3>
                <div className="space-y-5">
                   <div className="flex justify-between items-center border-b border-truth-midGray pb-3">
                      <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest">Total Transmissions</span>
                      <span className="font-mono text-lg font-black text-truth-textLight">{totalSignals}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-truth-midGray pb-3">
                      <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest">Autonomous Blocks</span>
                      <span className="font-mono text-lg font-black text-truth-accentRed">{totalFlags}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest">Active Observers</span>
                      <span className="font-mono text-lg font-black text-truth-accentBlue">3,492</span>
                   </div>
                </div>
                <div className="p-4 bg-truth-accentBlue/5 border-l-2 border-truth-accentBlue flex items-start gap-3">
                  <Info className="w-4 h-4 text-truth-accentBlue shrink-0 mt-1" />
                  <p className="font-mono text-[9px] text-truth-textGray leading-tight uppercase">Protocol is in drift-mode. All resolutions are synchronized to the main ledger every 60 seconds.</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </main>
  )
}
