// lib/actions/nftActions.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { NftStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

/**
 * Mint the currently active shadow identity as a unique digital asset.
 * This is initially a simulation of the minting process, preparing metadata for an L2 provider.
 */
export async function mintShadowIdentity(userId?: string) {
    const session = await auth()
    const targetUserId = userId || session?.user?.id
    if (!targetUserId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { shadowName: true, nftStatus: true }
    })

    if (!user || !user.shadowName) throw new Error("No shadow identity found to manifest.")
    if (user.nftStatus === NftStatus.MINTED) throw new Error("Shadow identity is already immutable on-chain.")

    // 2. Mocking Chain Transaction (Simulation)
    console.warn("Simulating minting on TruTH L2 Chain for:", user.shadowName)
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 2000))

    const txHash = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    // 3. Update Database
    await prisma.user.update({
        where: { id: targetUserId },
        data: {
            nftStatus: NftStatus.MINTED,
            nftTokenId: `THS-${Date.now()}`,
            nftContractAddress: "0xTRUTH_SHADOW_V1",
            nftMintedAt: new Date(),
        }
    })

    revalidatePath("/profile")
    return { success: true, txHash }
}

/**
 * Check if the current user has the authority to manifest their shadow.
 * Criteria: Reputation > 100 or Verified Status.
 */
export async function checkEligiblityForMint() {
    const session = await auth()
    if (!session?.user?.id) return { eligible: false }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
            reputationScore: true, 
            shadowVerified: true, 
            nftStatus: true 
        }
    })

    if (!user) return { eligible: false }
    if (user.nftStatus === NftStatus.MINTED) return { eligible: false, alreadyMinted: true }

    const eligible = user.reputationScore >= 100 || user.shadowVerified
    return { 
        eligible, 
        currentRep: user.reputationScore, 
        neededRep: 100 
    }
}
