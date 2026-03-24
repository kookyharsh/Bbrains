"use client"

import React, { useState, useEffect } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { xpApi } from "@/services/api/client"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { DataTable } from "@/features/admin/components/DataTable"
import { CrudModal } from "@/features/admin/components/CrudModal"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"

export default function XpConfigPage() {
    const [levels, setLevels] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [selectedLevel, setSelectedLevel] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({ levelNumber: "", requiredXp: "" })

    const fetchLevels = async () => {
        setIsLoading(true)
        try {
            const res = await xpApi.getLevels()
            if (res.success) {
                const levelsData = (res.data as any)?.data || res.data;
                setLevels(Array.isArray(levelsData) ? levelsData : []);
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
        
        setSubmitting(true)
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
        } finally {
            setSubmitting(false)
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
                subtitle="Manage level thresholds and required XP"
                action={{
                    label: "Add Level",
                    icon: <Plus className="size-4" />,
                    onClick: () => handleOpenModal()
                }}
            />

            <DataTable 
                columns={columns}
                data={levels}
                loading={isLoading}
                onDelete={(row) => { setSelectedLevel(row); setIsConfirmOpen(true); }}

            />

            <CrudModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedLevel ? "Edit Level" : "Add Level"}
                onSubmit={async () => await handleSubmit(new Event('submit') as any)}
                submitting={submitting}
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
                open={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Level"
                description={`Are you sure you want to delete Level ${selectedLevel?.levelNumber}?`}
            />
        </div>
    )
}
