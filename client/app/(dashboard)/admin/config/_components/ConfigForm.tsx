"use client"

import type { ConfigFormData } from "../_types"

interface ConfigFormProps {
    formData: ConfigFormData
    onChange: (data: ConfigFormData) => void
    disabled?: boolean
    isEditing: boolean
}

export function ConfigForm({ formData, onChange, disabled, isEditing }: ConfigFormProps) {
    return (
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
                    onChange={(e) =>
                        onChange({
                            ...formData,
                            key: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                        })
                    }
                    disabled={isEditing || disabled}
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
                        onChange={(e) =>
                            onChange({ ...formData, type: e.target.value as ConfigFormData["type"] })
                        }
                        disabled={disabled}
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
                    {formData.type === "boolean" ? (
                        <select
                            className="w-full h-10 px-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm"
                            value={formData.value}
                            onChange={(e) => onChange({ ...formData, value: e.target.value })}
                            disabled={disabled}
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
                            onChange={(e) => onChange({ ...formData, value: e.target.value })}
                            disabled={disabled}
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
                    onChange={(e) => onChange({ ...formData, description: e.target.value })}
                    disabled={disabled}
                />
            </div>
        </div>
    )
}
