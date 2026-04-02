// components/profile/NftManifesto.tsx
"use client"

import { useState, useTransition } from "react"
import { NftStatus } from "@prisma/client"
import { Zap, ExternalLink, Loader2, Sparkles, Database } from "lucide-react"
import { mintShadowIdentity } from "@/lib/actions/nftActions"

interface NftManifestoProps {
    user: {
        id: string
        shadowName: string | null
        nftStatus: NftStatus
        nftTokenId?: string | null
        nftContractAddress?: string | null
        nftMintedAt?: Date | null
        reputationScore: number
    }
    isOwnProfile: boolean
}

export default function NftManifesto({ user, isOwnProfile }: NftManifestoProps) {
    const [isPending, startTransition] = useTransition()
    const [mintResult, setMintResult] = useState<{ success?: boolean, txHash?: string } | null>(null)

    const handleMint = () => {
        startTransition(async () => {
            try {
                const result = await mintShadowIdentity(user.id)
                setMintResult(result)
            } catch (error) {
                console.error("Minting protocol failed:", error)
            }
        })
    }

    const isMinted = user.nftStatus === NftStatus.MINTED || mintResult?.success

    return (
        <section className="space-y-6">
            <h2 className="font-bitter text-2xl font-black text-truth-textLight uppercase tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-6 bg-truth-accentPurple" /> Digital_Asset_Bureau
            </h2>
            
            <div className="relative group overflow-hidden bg-truth-nearBlack border-2 border-truth-midGray p-8 shadow-[20px_20px_0px_rgba(155,93,229,0.05)]">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-truth-accentPurple/5 rounded-full blur-3xl group-hover:bg-truth-accentPurple/10 transition-colors" />
                
                <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-[0.3em] block mb-1">On-Chain_Identity_Status</span>
                            <h3 className="font-bitter font-black text-3xl text-truth-textLight uppercase tracking-tighter">
                                {isMinted ? "MANIFESTED_IMMUTABLE" : "EPHEMERAL_STANDBY"}
                            </h3>
                        </div>
                        <div className={`p-3 border-2 ${isMinted ? "bg-truth-accentPurple/20 border-truth-accentPurple text-truth-accentPurple" : "border-truth-midGray text-truth-textGray"} rotate-12`}>
                            <Database className="w-6 h-6 -rotate-12" />
                        </div>
                    </div>

                    <div className="p-6 bg-truth-darkGray/30 border border-truth-midGray/50 font-mono text-[11px] leading-relaxed text-truth-textGray">
                        {isMinted ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-truth-accentPurple font-black italic">
                                    <Sparkles className="w-3 h-3" /> SECURITY_ENVELOPE_SEALED
                                </div>
                                <p>Shadow identity <span className="text-truth-textLight">[{user.shadowName}]</span> has been anchored to TruTH L2. Ownership is verified and transferable.</p>
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-truth-midGray/50">
                                    <div>
                                        <span className="block text-[8px] opacity-40">TOKEN_ID</span>
                                        <span className="text-truth-textLight">{user.nftTokenId || "THS-GHOST-304"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] opacity-40">TX_HASH</span>
                                        <span className="text-truth-textLight truncate block w-24">
                                            {mintResult?.txHash || "0x4f...a23e"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p>Current shadow identity is stored locally. Anchor your persona to the immutable ledger to gain permanent verification and marketplace eligibility.</p>
                        )}
                    </div>

                    {!isMinted && isOwnProfile && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                                <span className="text-truth-textGray flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> Min_Reputation:
                                </span>
                                <span className={user.reputationScore >= 100 ? "text-truth-accentGreen" : "text-truth-accentRed"}>
                                    {user.reputationScore}/100
                                </span>
                            </div>
                            
                            <button 
                                onClick={handleMint}
                                disabled={isPending || user.reputationScore < 100}
                                className={`w-full py-4 font-mono font-black text-xs uppercase tracking-widest transition-all
                                    ${user.reputationScore >= 100 
                                        ? "bg-truth-accentPurple text-white hover:bg-white hover:text-truth-bg shadow-[8px_8px_0px_rgba(155,93,229,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none" 
                                        : "bg-truth-darkGray/50 text-truth-textGray border-2 border-truth-midGray cursor-not-allowed opacity-50"}
                                `}
                            >
                                {isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> ANCHORING_IDENTITY...
                                    </div>
                                ) : "MANIFEST_SHADOW_ON_CHAIN"}
                            </button>
                        </div>
                    )}

                    {isMinted && (
                        <button className="w-full py-4 border-2 border-truth-accentPurple text-truth-accentPurple hover:bg-truth-accentPurple hover:text-white transition-all font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3">
                            VIEW_ON_LEDGER <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}
