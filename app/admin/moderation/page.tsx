import { requireAdmin } from "@/lib/auth-utils"
import { getPendingReports } from "@/lib/actions/report"
import { ShieldAlert, ShieldCheck, Users, Clock, Filter, MoreVertical, ExternalLink, UserMinus, AlertTriangle } from "lucide-react"

export default async function ModerationQueuePage() {
  const user = await requireAdmin()
  const reports = await getPendingReports()

  // Priority color mapping
  const priorityStyles: Record<string, string> = {
    CRITICAL: "bg-truth-accentRed text-white border-truth-accentRed shadow-[0_0_10px_rgba(255,51,102,0.3)]",
    HIGH: "bg-truth-accentRed/20 text-truth-accentRed border-truth-accentRed/50",
    MEDIUM: "bg-truth-accentBlue/20 text-truth-accentBlue border-truth-accentBlue/50",
    LOW: "bg-truth-midGray/20 text-truth-textGray border-truth-midGray/50"
  }

  return (
    <main className="min-h-screen bg-truth-bg text-truth-textLight pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-truth-midGray pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-mono text-[10px] text-truth-accentRed uppercase tracking-[0.4em]">
              <ShieldAlert className="w-4 h-4 animate-pulse" /> Protocol Enforcement System
            </div>
            <h1 className="font-bitter text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Moderation <span className="text-truth-accentRed">Queue</span>
            </h1>
          </div>
          <div className="flex flex-col gap-4">
             <div className="p-4 bg-truth-nearBlack border border-truth-midGray font-mono text-[10px] uppercase tracking-widest text-truth-textGray flex items-center gap-4">
               <span className="flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3 text-truth-accentGreen" /> Admin: 
                 <span className="text-truth-accentGreen">{user.username}</span>
               </span>
               <div className="w-px h-3 bg-truth-midGray" />
               <span className="flex items-center gap-2">
                 <Clock className="w-3 h-3" /> System Time: {new Date().toLocaleTimeString()}
               </span>
             </div>
             <div className="flex gap-4">
                <div className="flex-1 px-4 py-2 bg-truth-nearBlack border border-truth-midGray font-mono text-[10px] uppercase text-truth-textGray flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Sort: <span className="text-truth-textLight">Priority / Recency</span>
                </div>
                <div className="flex-1 px-4 py-2 bg-truth-nearBlack border border-truth-midGray font-mono text-[10px] uppercase text-truth-textGray flex items-center gap-2">
                   <Users className="w-3 h-3" /> Queue: <span className="text-truth-accentRed font-black">{reports.length}</span>
                </div>
             </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Queue */}
          <div className="lg:col-span-2 space-y-8">
            {reports.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-6 border-2 border-dashed border-truth-midGray rounded-sm opacity-40">
                <ShieldCheck className="w-12 h-12 text-truth-accentGreen" />
                <div className="text-center">
                  <h2 className="font-bitter text-2xl font-black uppercase">Protocol Healthy</h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest mt-2">No pending report signals found.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <div 
                    key={report.id}
                    className="group bg-truth-nearBlack border-2 border-truth-midGray hover:border-truth-accentRed transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Priority Stripe */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${report.priority === 'CRITICAL' ? 'bg-truth-accentRed' : report.priority === 'HIGH' ? 'bg-truth-accentRed/50' : 'bg-truth-textGray'}`} />
                    
                    <div className="p-8 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                           <span className={`px-3 py-1 font-mono text-[9px] font-black uppercase tracking-widest border rounded-full ${priorityStyles[report.priority]}`}>
                             {report.priority}_SEVERITY
                           </span>
                           <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest">
                             ID: {report.id.substring(0, 8)}...
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-truth-textGray text-[10px] font-mono uppercase tracking-widest">
                           {report.duplicateCount > 1 && (
                             <span className="bg-truth-accentRed/10 text-truth-accentRed px-2 py-0.5 border border-truth-accentRed/20 font-black">
                               {report.duplicateCount}_AGGREGATED
                             </span>
                           )}
                           <span>{new Date(report.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Target Content Info */}
                        <div className="space-y-4">
                           <label className="font-mono text-[9px] uppercase tracking-[.3em] text-truth-textGray block">Signal Target</label>
                           <div className="p-4 bg-black/40 border border-truth-midGray/50 min-h-[100px]">
                              <p className="font-bitter text-sm text-truth-textLight leading-relaxed line-clamp-4">
                                {report.post?.content || report.message?.content || "[CONTENT_DELETED_OR_MASKED]"}
                              </p>
                              <div className="mt-4 flex items-center justify-between font-mono text-[8px] uppercase tracking-widest text-truth-textGray">
                                <span>Author: <span className="text-truth-textLight">{report.post?.author?.username || "ANON"}</span></span>
                                <span>Author_Status: <span className={report.post?.author?.status === 'ACTIVE' ? 'text-truth-accentGreen' : 'text-truth-accentRed'}>{report.post?.author?.status}</span></span>
                              </div>
                           </div>
                        </div>

                        {/* Report Analysis */}
                        <div className="space-y-4">
                           <label className="font-mono text-[9px] uppercase tracking-[.3em] text-truth-textGray block">Violation Intel</label>
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="px-3 py-1 bg-white/5 border border-white/10 font-mono text-[10px] font-black text-white uppercase tracking-wider">
                                   {report.reason}
                                 </div>
                              </div>
                              <p className="font-mono text-[10px] text-truth-textGray uppercase leading-relaxed font-bold italic">
                                &quot;{report.description || "NO_DESCRIPTION_PROVIDED"}&quot;
                              </p>
                              <div className="flex items-center gap-4 pt-2 border-t border-truth-midGray/30">
                                 <div className="flex-1">
                                    <div className="text-[8px] font-mono text-truth-textGray uppercase">Reporter Trust</div>
                                    <div className="text-[10px] font-mono text-truth-accentBlue font-black uppercase">{report.reporter.reputationTier} ({report.reporter.credibilityScore}%)</div>
                                 </div>
                                 <div className="flex-1">
                                    <div className="text-[8px] font-mono text-truth-textGray uppercase">Anonymity</div>
                                    <div className="text-[10px] font-mono text-truth-textLight font-black uppercase">{report.isAnonymous ? "MASKED" : "UNMASKED"}</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>

                      {/* Moderator Actions Footer */}
                      <div className="pt-6 border-t border-truth-midGray/50 flex flex-wrap gap-4 items-center justify-between">
                         <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-truth-accentGreen text-truth-bg font-mono text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                               <ShieldCheck className="w-3 h-3" /> DISMISS_SIGNAL
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-truth-accentRed text-white font-mono text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_pink] transition-all">
                               <ShieldAlert className="w-3 h-3" /> ACTION_VIOLATION
                            </button>
                         </div>
                         <div className="flex gap-3">
                            <button className="p-2 border border-truth-midGray hover:text-truth-accentBlue hover:border-truth-accentBlue transition-all" title="View Source">
                               <ExternalLink className="w-4 h-4" />
                            </button>
                            <button className="p-2 border border-truth-midGray hover:text-truth-accentRed hover:border-truth-accentRed transition-all" title="Shadow Ban User">
                               <UserMinus className="w-4 h-4" />
                            </button>
                            <button className="p-2 border border-truth-midGray hover:text-truth-textLight hover:border-truth-textLight transition-all">
                               <MoreVertical className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
             <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray space-y-6">
                <h3 className="font-bitter text-2xl font-black uppercase tracking-tighter">Queue Metrics</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-end border-b border-truth-midGray pb-2">
                       <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest">Active Flags</span>
                       <span className="font-mono text-2xl text-truth-accentRed font-black leading-none">{reports.length}</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-truth-midGray pb-2">
                       <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest">Critical Signals</span>
                       <span className="font-mono text-2xl text-truth-accentRed font-black leading-none">
                         {reports.filter(r => r.priority === 'CRITICAL').length}
                       </span>
                   </div>
                   <div className="flex justify-between items-end border-b border-truth-midGray pb-2">
                       <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest">Auto-Hidden</span>
                       <span className="font-mono text-2xl text-truth-accentBlue font-black leading-none">
                         {reports.filter(r => r.duplicateCount >= 10).length}
                       </span>
                   </div>
                </div>
                <div className="p-4 bg-truth-accentRed/5 border-l-2 border-truth-accentRed flex items-start gap-3">
                   <AlertTriangle className="w-4 h-4 text-truth-accentRed shrink-0 mt-1" />
                   <p className="font-mono text-[9px] text-truth-textGray uppercase leading-tight">
                     <span className="text-truth-accentRed font-black">ALERT:</span> {reports.filter(r => r.priority === 'CRITICAL').length > 0 ? "Critical protocol violations detected. Immediate resolution required." : "Protocol within normal parameters."}
                   </p>
                </div>
             </div>

             <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray space-y-6 relative overflow-hidden group">
                <h3 className="font-bitter text-2xl font-black uppercase tracking-tighter">Moderator Audit</h3>
                <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest leading-relaxed">
                   Administrative consensus protocol is active. All actions are logged to the root node immutable ledger.
                </p>
                <div className="space-y-4 pt-4">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex gap-3 items-start opacity-40">
                        <div className="w-2 h-2 rounded-full bg-truth-accentGreen mt-1" />
                        <div className="space-y-1">
                           <div className="text-[8px] font-mono text-truth-textGray uppercase tracking-widest">MAR_02_2026_10:14:AM</div>
                           <div className="text-[10px] font-mono text-truth-textLight uppercase font-bold tracking-tight">POST_TERMINATED_ID_7F2A...</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </main>
  )
}
