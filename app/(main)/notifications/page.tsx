// app/(main)/notifications/page.tsx
import { getNotifications } from "@/lib/actions/notification"
import NotificationList from "@/components/notifications/NotificationList"
import { Bell, Shield } from "lucide-react"

export const metadata = {
  title: "Notifications | TruTH",
  description: "Signal feedback and node synchronization alerts."
}

export default async function NotificationsPage() {
  const notifications = await getNotifications(50)

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 animate-fadeIn">
      <div className="mb-12 relative">
        <div className="flex items-center gap-4 sm:gap-6 border-b-4 border-truth-accentRed pb-8 flex-wrap">
           <div className="w-12 h-12 sm:w-16 sm:h-16 bg-truth-accentRed flex items-center justify-center shadow-[8px_8px_0px_rgba(255,51,102,0.2)] shrink-0">
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-truth-bg animate-pulse" />
           </div>
           <div className="min-w-0">
              <h1 className="font-bitter text-4xl sm:text-5xl font-black text-truth-textLight uppercase tracking-tighter leading-tight">Signal_Center</h1>
              <p className="font-mono text-[10px] sm:text-xs text-truth-accentRed uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 font-bold italic">Node_Status: Online // Decryption_Active</p>
           </div>
        </div>
        
        {/* Decorative Protocol ID */}
        <div className="absolute -top-4 right-0 font-mono text-[10px] text-truth-midGray uppercase tracking-widest hidden md:block">
           Encryption_Protocol: AES-256-GCM
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="bg-truth-surface p-4 sm:p-8 border-2 border-truth-surface-border relative overflow-hidden group">
           {/* Background Grid for Brutalist Feel */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none opacity-20" />
           
           <NotificationList initialNotifications={notifications} />
        </section>

        {/* Security / Info Tip */}
        <div className="p-6 bg-truth-accentBlue/10 border-2 border-truth-accentBlue/30 flex items-start gap-4">
           <Shield className="w-6 h-6 text-truth-accentBlue mt-1" />
           <div>
              <h4 className="font-mono text-xs font-black uppercase text-truth-accentBlue mb-2">Security_Protocol_Tip</h4>
              <p className="font-mono text-[10px] text-truth-textGray uppercase leading-relaxed">
                 Signal feedback is ephemeral. Notifications older than 30 cycles are automatically purged to maintain node efficiency.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
