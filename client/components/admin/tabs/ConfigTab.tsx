"use client"

import React, { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, Settings2, ShieldCheck, ToggleLeft, Hash, Braces, Type } from "lucide-react"
import { configApi, SystemConfig } from "@/lib/api-services"
import { SectionHeader } from "@/components/admin/SectionHeader"
import { DataTable } from "@/components/admin/DataTable"
import { CrudModal } from "@/components/admin/CrudModal"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ConfigTab() {
    const [configs, setConfigs] = useState<SystemConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null)
    const [submitting, setSubmitting] = useState(false)
    
    const [formData, setFormData] = useState({
        key: "",
        value: "",
        type: "string",
        description: ""
    })

    const fetchConfigs = async () => {
        setIsLoading(true)
        try {
            const res = await configApi.getConfigs()
            if (res.success) {
                setConfigs(res.data)
            }
        } catch (error) {
            console.error("Error fetching configs:", error)
            toast.error("Failed to load configurations")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchConfigs()
    }, [])

    const handleOpenModal = (config?: SystemConfig) => {
        if (config) {
            setSelectedConfig(config)
            setFormData({
                key: config.key,
                value: config.value,
                type: config.type,
                description: config.description || ""
            })
        } else {
            setSelectedConfig(null)
            setFormData({
                key: "",
                value: "",
                type: "string",
                description: ""
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await configApi.updateConfig(formData)
            if (res.success) {
                toast.success(selectedConfig ? "Configuration updated" : "Configuration created")
                setIsModalOpen(false)
                fetchConfigs()
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
                fetchConfigs()
            }
        } catch (error) {
            toast.error("Failed to delete configuration")
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'boolean': return <ToggleLeft className="size-3 mr-1" />
            case 'number': return <Hash className="size-3 mr-1" />
            case 'json': return <Braces className="size-3 mr-1" />
            default: return <Type className="size-3 mr-1" />
        }
    }

    const columns = [
        { 
            key: "key", 
            label: "Configuration Key",
            render: (row: SystemConfig) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">{row.key}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{row.description}</span>
                </div>
            )
        },
        { 
            key: "type", 
            label: "Type",
            render: (row: SystemConfig) => (
                <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 py-0 flex items-center w-fit">
                    {getTypeIcon(row.type)}
                    {row.type}
                </Badge>
            )
        },
        { 
            key: "value", 
            label: "Value",
            render: (row: SystemConfig) => (
                <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border/50 max-w-[200px] truncate block">
                    {row.value}
                </code>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <SectionHeader 
                title="System Configuration" 
                subtitle="Manage global system settings, feature flags and constants"
                action={{
                    label: "Add Config",
                    icon: <Plus className="size-4" />,
                    onClick: () => handleOpenModal()
                }}
            />

            <DataTable 
                columns={columns}
                data={configs}
                isLoading={isLoading}
                searchKeys={["key", "description"]}
                actions={(row) => (
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleOpenModal(row)} 
                            className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                        >
                            <Pencil className="size-4" />
                        </button>
                        <button 
                            onClick={() => { setSelectedConfig(row); setIsConfirmOpen(true); }} 
                            className="p-2 text-red-500/80 hover:text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                )}
            />

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => !submitting && setIsModalOpen(false)}
                title={selectedConfig ? "Edit Configuration" : "Add Configuration"}
                onSubmit={handleSubmit}
                submitting={submitting}
            >
                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                            Config Key
                        </label>
                        <input
                            type="text"
                            className="w-full h-10 px-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-mono text-sm"
                            placeholder="e.g. MAINTENANCE_MODE"
                            value={formData.key}
                            onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                            disabled={!!selectedConfig || submitting}
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                                Type
                            </label>
                            <select
                                className="w-full h-10 px-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                disabled={submitting}
                            >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="json">JSON</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                                Value
                            </label>
                            {formData.type === 'boolean' ? (
                                <select
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    disabled={submitting}
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm"
                                    placeholder="Enter value"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    disabled={submitting}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                            Description
                        </label>
                        <textarea
                            className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm min-h-[80px]"
                            placeholder="Describe what this config does..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            disabled={submitting}
                        />
                    </div>
                </div>

            </CrudModal>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Configuration"
                description={`Are you sure you want to delete ${selectedConfig?.key}? This might break system features depending on this key.`}
            />
        </div>
    )
}
