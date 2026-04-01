import { getUserByUsername } from "@/lib/actions/user"
import ProfileHeader from "@/components/profile/ProfileHeader"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const user = await getUserByUsername(username)

  if (!user) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-truth-bg text-truth-textLight pt-20">
      <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-fadeIn">
        <ProfileHeader user={user} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
             <h2 className="font-bitter text-3xl font-black text-truth-textLight uppercase tracking-tight flex items-center gap-3">
               <div className="w-2 h-8 bg-truth-accentRed" /> Recent Transmissions
             </h2>
             <div className="p-20 border-2 border-dashed border-truth-midGray text-center rounded-lg">
               <p className="font-mono text-xs text-truth-textGray uppercase tracking-widest">Awaiting Signal Synchronization (Posts coming soon)</p>
             </div>
          </div>
          
          <div className="space-y-8">
            <h2 className="font-bitter text-3xl font-black text-truth-textLight uppercase tracking-tight">Identity Data</h2>
            <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray">
              <h3 className="font-mono text-[10px] uppercase font-bold text-truth-textGray mb-4">Signal Metadata</h3>
              <ul className="space-y-4 font-mono text-xs text-truth-textLight/70">
                <li className="flex justify-between border-b border-truth-midGray pb-2">
                  <span>Network Status</span>
                  <span className="text-truth-accentGreen font-bold">Active</span>
                </li>
                <li className="flex justify-between border-b border-truth-midGray pb-2">
                  <span>Account Tier</span>
                  <span className="text-truth-textGray uppercase">{user.isAnonymous ? "Shadow" : "Verified"}</span>
                </li>
                <li className="flex justify-between">
                  <span>Origin Point</span>
                  <span className="text-truth-textGray">Earth Node-7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
