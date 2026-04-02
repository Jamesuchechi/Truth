"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import type { MessageType, ToneType } from "@prisma/client"

export async function getMessagesForExport(filters: {
    type?: MessageType
    tone?: ToneType
    startDate?: string
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    return await prisma.message.findMany({
        where: {
            receiverId: session.user.id,
            type: filters.type,
            tone: filters.tone,
            createdAt: filters.startDate ? { gte: new Date(filters.startDate) } : undefined,
            deletedAt: null
        },
        include: {
            sender: {
                select: {
                    username: true,
                    image: true,
                    shadowName: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

interface TypeDistribution {
    type: MessageType
    _count: { id: number }
}

interface ToneDistribution {
    tone: ToneType | null
    _count: { id: number }
}

export async function getInboxAnalytics() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const userId = session.user.id

    // 1. Total Signals
    const totalSignals = await prisma.message.count({
        where: { receiverId: userId, deletedAt: null }
    })

    // 2. Type Distribution
    const typeDistribution = await prisma.message.groupBy({
        by: ['type'],
        where: { receiverId: userId, deletedAt: null },
        _count: { id: true }
    })

    const typeData = typeDistribution.map((t: TypeDistribution) => ({
        name: t.type,
        value: t._count.id
    }))

    // 3. Tone Distribution
    const toneDistribution = await prisma.message.groupBy({
        by: ['tone'],
        where: { receiverId: userId, deletedAt: null },
        _count: { id: true }
    })

    const toneData = toneDistribution.map((t: ToneDistribution) => ({
        name: t.tone || 'NEUTRAL',
        value: t._count.id
    }))

    // 4. Message Velocity (Last 7 Days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const velocityRaw = await prisma.message.findMany({
        where: {
            receiverId: userId,
            createdAt: { gte: sevenDaysAgo },
            deletedAt: null
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
    })

    // Group by date
    const velocityMap = new Map<string, number>()
    for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        velocityMap.set(d.toISOString().split('T')[0], 0)
    }

    velocityRaw.forEach(msg => {
        const dateStr = msg.createdAt.toISOString().split('T')[0]
        if (velocityMap.has(dateStr)) {
            velocityMap.set(dateStr, (velocityMap.get(dateStr) || 0) + 1)
        }
    })

    // 5. Peak Messaging Times (By Hour of Day)
    const hourCounts = new Array(24).fill(0)
    velocityRaw.forEach(msg => {
        const hour = new Date(msg.createdAt).getHours()
        hourCounts[hour]++
    })
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
    const peakCount = hourCounts[peakHour]

    const velocityData = Array.from(velocityMap.entries())
        .map(([name, count]) => ({ name, count }))
        .reverse()

    return {
        totalSignals,
        typeData,
        toneData,
        velocityData,
        peakHour,
        peakCount
    }
}
