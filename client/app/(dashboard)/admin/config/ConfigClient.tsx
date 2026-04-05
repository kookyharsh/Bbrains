"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Plus, Lock } from "lucide-react"
import { configApi } from "@/services/api/client"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { CrudModal } from "@/features/admin/components/CrudModal"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { ConfigTable } from "./_components/ConfigTable"
import { ConfigForm } from "./_components/ConfigForm"
import { fetchConfigs } from "./data"
import { getInitFormData, getInitFormDataFromConfig, type ConfigFormData, type SystemConfig } from "./_types"
import { useHasPermission } from "@/components/providers/permissions-provider"

interface ConfigClientProps {
    initialConfigs: SystemConfig[]
}

export function ConfigClient({ initialConfigs }: ConfigClientProps) {
    const canManageInstitution = useHasPermission("manage_institution")
    const [configs, setConfigs] = useState<SystemConfig[]>(initialConfigs)
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState<ConfigFormData>(getInitFormData())

    if (!canManageInstitution) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 text-muted-foreground">
                <Lock className="size-10 opacity-40" />
                <p className="text-sm font-medium">Access Denied</p>
                <p className="text-xs">You need the "Manage Institution" permission to view this page.</p>
            </div>
        )
    }

    const loadConfigs = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await fetchConfigs()
            setConfigs(data)
        } catch (error) {
            console.error("Error fetching configs:", error)
            toast.error("Failed to load configurations")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadConfigs()
    }, [loadConfigs])

    const handleOpenModal = (config?: SystemConfig) => {
        if (config) {
            setSelectedConfig(config)
            setFormData(getInitFormDataFromConfig(config))
        } else {
            setSelectedConfig(null)
            setFormData(getInitFormData())
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const res = await configApi.updateConfig(formData)
            if (res.success) {
                toast.success(selectedConfig ? "Configuration updated" : "Configuration created")
                setIsModalOpen(false)
                loadConfigs()
            } else {
                toast.error(res.message || "Failed to save configuration")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedConfig) return
        try {
            const res = await configApi.deleteConfig(selectedConfig.key)
            if (res.success) {
                toast.success("Configuration deleted")
                setIsConfirmOpen(false)
                loadConfigs()
            }
        } catch (error) {
            toast.error("Failed to delete configuration")
        }
    }

    const handleDeleteClick = (config: SystemConfig) => {
        setSelectedConfig(config)
        setIsConfirmOpen(true)
    }

    return (
        <div className="space-y-6">
            <SectionHeader
                title="System Configuration"
                subtitle="Manage global system settings, feature flags and constants"
                action={{
                    label: "Add Config",
                    icon: <Plus className="size-4" />,
                    onClick: () => handleOpenModal(),
                }}
            />

            <ConfigTable
                loading={isLoading}
                data={configs}
                onEdit={handleOpenModal}
                onDelete={handleDeleteClick}
            />

            <CrudModal
                open={isModalOpen}
                onClose={() => !submitting && setIsModalOpen(false)}
                title={selectedConfig ? "Edit Configuration" : "Add Configuration"}
                onSubmit={handleSubmit}
                submitting={submitting}
            >
                <ConfigForm
                    formData={formData}
                    onChange={setFormData}
                    disabled={submitting}
                    isEditing={!!selectedConfig}
                />
            </CrudModal>

            <ConfirmDialog
                open={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Configuration"
                description={`Are you sure you want to delete ${selectedConfig?.key}? This might break system features depending on this key.`}
            />
        </div>
    )
}
