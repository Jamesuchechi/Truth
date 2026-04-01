import SettingsForm from "@/components/auth/SettingsForm"

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h1 className="font-bitter text-5xl font-black text-truth-textLight uppercase tracking-tight mb-4">Network Settings</h1>
        <p className="font-mono text-sm text-truth-textGray uppercase tracking-widest">Adjust your internal status and security protocols</p>
      </div>
      
      <SettingsForm />
    </div>
  )
}
