"use client"

import React from "react"
import { FormInput, FormTextarea } from "@/features/admin/components/form"
import type { ProductFormData } from "../_types"

interface ProductEditFormProps {
    form: ProductFormData
    onChange: (form: ProductFormData) => void
}

export function ProductEditForm({ form, onChange }: ProductEditFormProps) {
    return (
        <>
            <FormInput
                label="Name"
                required
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
            />
            <FormTextarea
                label="Description"
                value={form.description}
                onChange={(v) => onChange({ ...form, description: v })}
            />
            <div className="grid grid-cols-2 gap-3">
                <FormInput
                    label="Price"
                    required
                    type="number"
                    value={form.price}
                    onChange={(e) => onChange({ ...form, price: e.target.value })}
                />
                <FormInput
                    label="Stock"
                    required
                    type="number"
                    value={form.stock}
                    onChange={(e) => onChange({ ...form, stock: e.target.value })}
                />
            </div>
            <FormInput
                label="Image URL"
                value={form.imageUrl}
                onChange={(e) => onChange({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
            />
        </>
    )
}
