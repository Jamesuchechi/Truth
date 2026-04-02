import SettingsForm from "@/components/auth/SettingsForm"
import ShadowManagement from "@/components/profile/ShadowManagement"
import { auth } from "@/auth"

export default async function SettingsPage() {
  const session = await auth()
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-fadeIn">
      <div className="mb-12">
        <h1 className="font-bitter text-6xl font-black text-truth-textLight uppercase tracking-tighter mb-4">Network_Protocols</h1>
        <p className="font-mono text-sm text-truth-textGray uppercase tracking-[0.3em]">Adjust your internal status and security nodes</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
        <SettingsForm />
        <div className="space-y-12">
          {session?.user && <ShadowManagement user={session.user} />}
        </div>
      </div>
    </div>
  )
}
