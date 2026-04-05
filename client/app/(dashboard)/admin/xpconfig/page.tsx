"use client"

import React, { useState, useEffect } from "react"
import { Plus, Lock } from "lucide-react"
import { xpApi, type LevelThreshold } from "@/services/api/client"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { DataTable } from "@/features/admin/components/DataTable"
import { CrudModal } from "@/features/admin/components/CrudModal"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { useHasPermission } from "@/components/providers/permissions-provider"

export default function XpConfigPage() {
    const canManageInstitution = useHasPermission("manage_institution")
    const [levels, setLevels] = useState<LevelThreshold[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [selectedLevel, setSelectedLevel] = useState<LevelThreshold | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({ levelNumber: "", requiredXp: "" })

    useEffect(() => {
        if (!canManageInstitution) {
            setIsLoading(false)
            return
        }

        const fetchLevels = async () => {
            setIsLoading(true)
            try {
                const res = await xpApi.getLevels()
                if (res.success) {
                    setLevels(Array.isArray(res.data) ? res.data : [])
                }
            } catch (error) {
                console.error("Error fetching levels:", error)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchLevels()
    }, [canManageInstitution])

    if (!canManageInstitution) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 text-muted-foreground">
                <Lock className="size-10 opacity-40" />
                <p className="text-sm font-medium">Access Denied</p>
                <p className="text-xs">You need the &quot;Manage Institution&quot; permission to view this page.</p>
            </div>
        )
    }

    const handleOpenModal = (level?: LevelThreshold) => {
        if (level) {
            setSelectedLevel(level)
            setFormData({ levelNumber: level.levelNumber.toString(), requiredXp: level.requiredXp.toString() })
        } else {
            setSelectedLevel(null)
            setFormData({ levelNumber: "", requiredXp: "" })
        }
        setIsModalOpen(true)
    }

    const refreshLevels = async () => {
        setIsLoading(true)
        try {
            const res = await xpApi.getLevels()
            if (res.success) {
                setLevels(Array.isArray(res.data) ? res.data : [])
            }
        } catch (error) {
            console.error("Error fetching levels:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const levelNum = parseInt(formData.levelNumber, 10)
        const reqXp = parseInt(formData.requiredXp, 10)

        setSubmitting(true)
        try {
            if (selectedLevel) {
                await xpApi.updateLevel(levelNum, reqXp)
            } else {
                await xpApi.createLevel(levelNum, reqXp)
            }
            setIsModalOpen(false)
            await refreshLevels()
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
            await refreshLevels()
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
                onDelete={(row) => {
                    setSelectedLevel(row as LevelThreshold)
                    setIsConfirmOpen(true)
                }}
            />

            <CrudModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedLevel ? "Edit Level" : "Add Level"}
                onSubmit={async () => {
                    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
                    await handleSubmit(syntheticEvent)
                }}
                submitting={submitting}
            >
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Level Number</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-border bg-background p-2"
                            value={formData.levelNumber}
                            onChange={(e) => setFormData({ ...formData, levelNumber: e.target.value })}
                            disabled={!!selectedLevel}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Required XP</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-border bg-background p-2"
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
