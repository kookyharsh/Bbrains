"use client"

import React, { useState, useEffect } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { xpApi } from "@/lib/api-services"
import { SectionHeader } from "@/components/admin/SectionHeader"
import { DataTable } from "@/components/admin/DataTable"
import { CrudModal } from "@/components/admin/CrudModal"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

export function XpConfigTab() {
    const [levels, setLevels] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [selectedLevel, setSelectedLevel] = useState<any>(null)
    const [formData, setFormData] = useState({ levelNumber: "", requiredXp: "" })

    const fetchLevels = async () => {
        setIsLoading(true)
        try {
            const res = await xpApi.getLevels()
            if (res.success) {
                setLevels(res.data)
            }
        } catch (error) {
            console.error("Error fetching levels:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLevels()
    }, [])

    const handleOpenModal = (level?: any) => {
        if (level) {
            setSelectedLevel(level)
            setFormData({ levelNumber: level.levelNumber.toString(), requiredXp: level.requiredXp.toString() })
        } else {
            setSelectedLevel(null)
            setFormData({ levelNumber: "", requiredXp: "" })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const levelNum = parseInt(formData.levelNumber)
        const reqXp = parseInt(formData.requiredXp)
        
        try {
            if (selectedLevel) {
                await xpApi.updateLevel(levelNum, reqXp)
            } else {
                await xpApi.createLevel(levelNum, reqXp)
            }
            setIsModalOpen(false)
            fetchLevels()
        } catch (error) {
            console.error("Error saving level:", error)
        }
    }

    const handleDelete = async () => {
        if (!selectedLevel) return
        try {
            await xpApi.deleteLevel(selectedLevel.levelNumber)
            setIsConfirmOpen(false)
            fetchLevels()
        } catch (error) {
            console.error("Error deleting level:", error)
        }
    }

    const columns = [
        { key: "levelNumber", label: "Level Number" },
        { key: "requiredXp", label: "Required XP" },
    ]

    return (
        <div className="space-y-6">
            <SectionHeader 
                title="XP & Levels Configuration" 
                description="Manage level thresholds and required XP"
                action={{
                    label: "Add Level",
                    icon: <Plus className="size-4" />,
                    onClick: () => handleOpenModal()
                }}
            />

            <DataTable 
                columns={columns}
                data={levels}
                isLoading={isLoading}
                actions={(row) => (
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(row)} className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg">
                            <Pencil className="size-4" />
                        </button>
                        <button onClick={() => { setSelectedLevel(row); setIsConfirmOpen(true); }} className="p-2 text-red-500/80 hover:text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg">
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                )}
            />

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedLevel ? "Edit Level" : "Add Level"}
                onSubmit={handleSubmit}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Level Number</label>
                        <input
                            type="number"
                            className="w-full p-2 bg-background border border-border rounded-lg"
                            value={formData.levelNumber}
                            onChange={(e) => setFormData({ ...formData, levelNumber: e.target.value })}
                            disabled={!!selectedLevel}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Required XP</label>
                        <input
                            type="number"
                            className="w-full p-2 bg-background border border-border rounded-lg"
                            value={formData.requiredXp}
                            onChange={(e) => setFormData({ ...formData, requiredXp: e.target.value })}
                            required
                        />
                    </div>
                </div>
            </CrudModal>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Level"
                description={`Are you sure you want to delete Level ${selectedLevel?.levelNumber}?`}
            />
        </div>
    )
}
