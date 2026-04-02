"use client"

import { useState } from "react"
import { 
    Download, FileJson, FileSpreadsheet, FileText, 
    X, Loader2, Calendar, Filter 
} from "lucide-react"
import { MessageType } from "@prisma/client"
import type { ToneType } from "@prisma/client"
import { getMessagesForExport } from "@/lib/actions/advancedActions"
import { motion } from "framer-motion"
import { saveAs } from "file-saver"
import Papa from "papaparse"
import jsPDF from "jspdf"
import "jspdf-autotable"

// Extend jsPDF with autotable types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF
  }
}

interface ExportDialogProps {
    isOpen: boolean
    onClose: () => void
}

type ExportFormat = "JSON" | "CSV" | "PDF"

export default function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
    const [format, setFormat] = useState<ExportFormat>("PDF")
    const [isExporting, setIsExporting] = useState(false)
    const [filters, setFilters] = useState({
        type: "ALL" as MessageType | "ALL",
        tone: "ALL" as ToneType | "ALL",
        days: 30
    })

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - filters.days)
            
            const messages = await getMessagesForExport({
                type: filters.type === "ALL" ? undefined : filters.type,
                tone: filters.tone === "ALL" ? undefined : filters.tone,
                startDate: startDate.toISOString()
            })

            const filename = `Truth_Export_${new Date().toISOString().split('T')[0]}`

            if (format === "JSON") {
                const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.download = `${filename}.json`
                link.click()
            } else if (format === "CSV") {
                const csvData = messages.map(m => ({
                    id: m.id,
                    content: m.content,
                    type: m.type,
                    tone: m.tone,
                    date: m.createdAt.toISOString(),
                    sender: m.sender?.username || (m.revealSender ? "REVEALED_USER" : "ANONYMOUS"),
                    favorite: m.isFavorite,
                    archived: m.isArchived
                }))
                const csv = Papa.unparse(csvData)
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
                saveAs(blob, `${filename}.csv`)
            } else if (format === "PDF") {
                const doc = new jsPDF()
                
                // Add header
                doc.setFillColor(18, 18, 18) // Truth Dark Background
                doc.rect(0, 0, 210, 40, "F")
                
                doc.setTextColor(255, 51, 102) // Truth Accent Red
                doc.setFont("helvetica", "bold")
                doc.setFontSize(28)
                doc.text("TRUTH.SYS EXPORT", 15, 25)
                
                doc.setTextColor(150, 150, 150)
                doc.setFontSize(10)
                doc.text(`GENERATED: ${new Date().toLocaleString()}`, 15, 35)
                
                const tableData = messages.map(m => [
                    m.createdAt.toISOString().split('T')[0],
                    m.type,
                    m.tone || 'NEUTRAL',
                    m.sender?.username || (m.revealSender ? "REVEALED_USER" : "ANONYMOUS"),
                    m.content
                ])

                doc.autoTable({
                    startY: 50,
                    head: [['DATE', 'TYPE', 'TONE', 'SENDER', 'CONTENT']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { 
                        fillColor: [255, 51, 102],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold'
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                        overflow: 'linebreak'
                    },
                    columnStyles: {
                        4: { cellWidth: 80 }
                    }
                })

                doc.save(`${filename}.pdf`)
            }
            onClose()
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-truth-bg/90 backdrop-blur-sm animate-fadeIn">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-truth-nearBlack border-4 border-truth-midGray shadow-[20px_20px_0px_rgba(255,51,102,0.1)] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-truth-midGray/10 p-6 flex items-center justify-between border-b-2 border-truth-midGray">
                    <div className="flex items-center gap-3">
                        <Download className="w-6 h-6 text-truth-accentRed" />
                        <h2 className="font-bitter text-2xl font-black text-truth-textLight uppercase tracking-tighter">Export_Protocol</h2>
                    </div>
                    <button onClick={onClose} className="text-truth-textGray hover:text-truth-accentRed transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Format Selection */}
                    <div className="space-y-4">
                        <label className="block font-mono text-[10px] uppercase font-black text-truth-textGray tracking-widest">Select_Format</label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: "PDF", icon: FileText, color: "text-truth-accentRed", bg: "bg-truth-accentRed/5" },
                                { id: "CSV", icon: FileSpreadsheet, color: "text-truth-accentGreen", bg: "bg-truth-accentGreen/5" },
                                { id: "JSON", icon: FileJson, color: "text-truth-accentBlue", bg: "bg-truth-accentBlue/5" },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setFormat(item.id as ExportFormat)}
                                    className={`flex flex-col items-center gap-3 p-4 border-2 transition-all
                                        ${format === item.id 
                                            ? `border-truth-textLight ${item.bg} shadow-[4px_4px_0px_rgba(255,255,255,0.1)]` 
                                            : "border-truth-midGray hover:border-truth-textGray"}`}
                                >
                                    <item.icon className={`w-8 h-8 ${format === item.id ? item.color : "text-truth-textGray"}`} />
                                    <span className="font-mono text-[10px] font-bold text-truth-textLight">{item.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Presets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-truth-midGray">
                         <div className="space-y-3">
                            <label className="flex items-center gap-2 font-mono text-[10px] uppercase font-black text-truth-textGray">
                                <Filter className="w-3 h-3" /> Type_Filter
                            </label>
                            <select 
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value as MessageType | "ALL"})}
                                className="w-full bg-truth-bg border-2 border-truth-midGray p-3 text-truth-textLight font-mono text-[10px] uppercase outline-none focus:border-truth-accentRed"
                            >
                                <option value="ALL">All_SigTypes</option>
                                {Object.values(MessageType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                         </div>
                         <div className="space-y-3">
                            <label className="flex items-center gap-2 font-mono text-[10px] uppercase font-black text-truth-textGray">
                                <Calendar className="w-3 h-3" /> Time_Horizon
                            </label>
                            <select 
                                value={filters.days}
                                onChange={(e) => setFilters({...filters, days: parseInt(e.target.value)})}
                                className="w-full bg-truth-bg border-2 border-truth-midGray p-3 text-truth-textLight font-mono text-[10px] uppercase outline-none focus:border-truth-accentRed"
                            >
                                <option value={7}>Last_7_Days</option>
                                <option value={30}>Last_30_Days</option>
                                <option value={90}>Last_Quarter</option>
                                <option value={365}>Last_Cycle</option>
                            </select>
                         </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full py-4 bg-truth-textLight text-truth-bg font-mono font-bold uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isExporting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Initiate_Export_Sequence
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
