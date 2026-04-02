"use client"

import { useEffect, useState } from "react"
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, AreaChart, 
    Area, Legend 
} from "recharts"
import { 
    Activity, PieChart as PieIcon, BarChart2, TrendingUp, 
    X, Loader2, Signal
} from "lucide-react"
import { getInboxAnalytics } from "@/lib/actions/advancedActions"
import { motion } from "framer-motion"

// Define data interfaces for type safety
interface AnalyticsData {
    totalSignals: number
    typeData: { name: string, value: number }[]
    toneData: { name: string, value: number }[]
    velocityData: { name: string, count: number }[]
    peakHour: number
    peakCount: number
}

const COLORS = ['#FF3366', '#00F5D4', '#00BBF9', '#FEE440', '#9b5de5']
const TONE_COLORS: Record<string, string> = {
    HONEST: '#00F5D4',
    HARSH: '#FF3366',
    FUNNY: '#FEE440',
    DEEP: '#9b5de5',
    NEUTRAL: '#4a4a4a'
}

interface AnalyticsViewProps {
    isOpen: boolean
    onClose: () => void
}

export default function AnalyticsView({ isOpen, onClose }: AnalyticsViewProps) {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            fetchAnalytics()
        }
    }, [isOpen])

    const fetchAnalytics = async () => {
        setIsLoading(true)
        try {
            const result = await getInboxAnalytics()
            setData(result)
        } catch (error) {
            console.error("Failed to fetch analytics:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-truth-bg/95 backdrop-blur-md animate-fadeIn">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-5xl h-[90vh] bg-truth-nearBlack border-4 border-truth-midGray shadow-[30px_30px_0px_rgba(255,51,102,0.1)] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-8 border-b-2 border-truth-midGray flex items-center justify-between bg-truth-midGray/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-truth-accentRed/10 border-2 border-truth-accentRed rotate-45">
                            <Activity className="w-6 h-6 text-truth-accentRed -rotate-45" />
                        </div>
                        <div>
                            <h2 className="font-bitter text-3xl font-black text-truth-textLight uppercase tracking-tighter">Signal_Intelligence</h2>
                            <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-[0.3em]">Neural analytics & pattern distribution</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 border-2 border-truth-midGray hover:border-truth-accentRed text-truth-textGray hover:text-truth-accentRed transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-12 h-12 text-truth-accentRed animate-spin" />
                            <span className="font-mono text-xs text-truth-textGray uppercase animate-pulse">Scanning_Encrypted_Data_Packets...</span>
                        </div>
                    ) : !data ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Signal className="w-12 h-12 text-truth-textGray opacity-20" />
                            <span className="font-mono text-xs text-truth-textGray uppercase tracking-widest">No_Intelligence_Data_Available</span>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="p-6 bg-truth-darkGray/50 border-2 border-truth-midGray relative overflow-hidden group">
                                    <Signal className="absolute -right-4 -bottom-4 w-24 h-24 text-truth-textLight opacity-[0.03] group-hover:opacity-[0.07] transition-opacity" />
                                    <span className="font-mono text-[9px] text-truth-textGray uppercase block mb-2">Total_Received</span>
                                    <h3 className="font-bitter text-5xl font-black text-truth-textLight">{data.totalSignals}</h3>
                                    <div className="mt-4 h-1 w-full bg-truth-midGray">
                                        <div className="h-full bg-truth-accentRed" style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div className="p-6 bg-truth-darkGray/50 border-2 border-truth-midGray">
                                    <span className="font-mono text-[9px] text-truth-textGray uppercase block mb-2">Primary_Signal_Type</span>
                                    <h4 className="font-bitter text-2xl font-black text-truth-accentBlue uppercase">{data.typeData[0]?.name || 'N/A'}</h4>
                                    <p className="font-mono text-[10px] text-truth-textGray mt-2 uppercase">Dominant signature detected</p>
                                </div>
                                <div className="p-6 bg-truth-darkGray/50 border-2 border-truth-midGray">
                                    <span className="font-mono text-[9px] text-truth-textGray uppercase block mb-2">Honesty_Index</span>
                                    <h4 className="font-bitter text-2xl font-black text-truth-accentGreen uppercase">
                                        {Math.round((data.toneData.find(t => t.name === 'HONEST')?.value || 0) / (data.totalSignals || 1) * 100)}%
                                    </h4>
                                    <p className="font-mono text-[10px] text-truth-textGray mt-2 uppercase">Integrity Score</p>
                                </div>
                                <div className="p-6 bg-truth-darkGray/50 border-2 border-truth-midGray">
                                    <span className="font-mono text-[9px] text-truth-textGray uppercase block mb-2">Peak_Signal_Window</span>
                                    <h4 className="font-bitter text-2xl font-black text-truth-accentYellow uppercase">
                                        {data.peakHour.toString().padStart(2, '0')}:00
                                    </h4>
                                    <p className="font-mono text-[10px] text-truth-textGray mt-2 uppercase">Most active hour detected</p>
                                </div>
                            </div>

                            {/* Charts Row 1 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-8 bg-truth-darkGray/30 border-2 border-truth-midGray space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-4 h-4 text-truth-accentRed" />
                                            <h4 className="font-mono text-[10px] font-black uppercase text-truth-textLight">Signal_Frequency_7D</h4>
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.velocityData}>
                                                <defs>
                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#FF3366" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#FF3366" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                                                <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#121212', border: '2px solid #2a2a2a', borderRadius: 0 }}
                                                    itemStyle={{ color: '#FF3366', fontFamily: 'monospace', fontSize: '10px' }}
                                                    labelStyle={{ color: '#fff', fontFamily: 'monospace', fontSize: '12px', marginBottom: '8px' }}
                                                />
                                                <Area type="monotone" dataKey="count" stroke="#FF3366" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="p-8 bg-truth-darkGray/30 border-2 border-truth-midGray space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <PieIcon className="w-4 h-4 text-truth-accentBlue" />
                                            <h4 className="font-mono text-[10px] font-black uppercase text-truth-textLight">Protocol_Distribution</h4>
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full flex items-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.typeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {data.typeData.map((_, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#121212', border: '2px solid #2a2a2a' }}
                                                    itemStyle={{ fontFamily: 'monospace', fontSize: '10px' }}
                                                />
                                                <Legend 
                                                    verticalAlign="bottom" 
                                                    iconType="rect"
                                                    wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Tone Chart Full Width */}
                            <div className="p-8 bg-truth-darkGray/30 border-2 border-truth-midGray space-y-6">
                                <div className="flex items-center gap-3">
                                    <BarChart2 className="w-4 h-4 text-truth-accentGreen" />
                                    <h4 className="font-mono text-[10px] font-black uppercase text-truth-textLight">Tone_Spectrum_Pattern</h4>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.toneData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                                            <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                cursor={{fill: '#1a1a1a'}}
                                                contentStyle={{ backgroundColor: '#121212', border: '2px solid #2a2a2a' }}
                                                itemStyle={{ fontFamily: 'monospace', fontSize: '10px' }}
                                            />
                                            <Bar dataKey="value" strokeWidth={2}>
                                                {data.toneData.map((entry, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={TONE_COLORS[entry.name] || '#666'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t-2 border-truth-midGray bg-truth-darkGray/20 flex justify-end">
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-3 border-2 border-truth-midGray hover:border-truth-textLight font-mono text-[10px] uppercase font-bold text-truth-textGray hover:text-truth-textLight transition-all"
                    >
                        Save_Analytics_Report
                    </button>
                    <button 
                        onClick={onClose}
                        className="ml-4 px-6 py-3 bg-truth-textLight text-truth-bg font-mono text-[10px] uppercase font-black hover:bg-white transition-all shadow-[6px_6px_0px_rgba(255,255,255,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                        Close_Neural_Link
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
