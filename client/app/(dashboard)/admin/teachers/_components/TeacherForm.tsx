"use client"

import React from "react"
import { FormInput, FormSelect } from "@/features/admin/components/form"
import type { TeacherForm } from "../_types"

interface TeacherFormFieldsProps {
    form: TeacherForm
    onChange: (form: TeacherForm) => void
    disabled?: boolean
}

export function TeacherFormFields({ form, onChange, disabled }: TeacherFormFieldsProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <FormInput
                    label="Username"
                    required
                    value={form.username}
                    onChange={(e) => onChange({ ...form, username: e.target.value })}
                    placeholder="username"
                    disabled={disabled}
                />
                <FormInput
                    label="Email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => onChange({ ...form, email: e.target.value })}
                    placeholder="email@domain.com"
                    disabled={disabled}
                />
                <FormInput
                    label="First Name"
                    required
                    value={form.firstName}
                    onChange={(e) => onChange({ ...form, firstName: e.target.value })}
                    placeholder="First"
                    disabled={disabled}
                />
                <FormInput
                    label="Last Name"
                    required
                    value={form.lastName}
                    onChange={(e) => onChange({ ...form, lastName: e.target.value })}
                    placeholder="Last"
                    disabled={disabled}
                />
                <FormSelect
                    label="Sex"
                    value={form.sex}
                    onChange={(v) => onChange({ ...form, sex: v })}
                    options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                    ]}
                    disabled={disabled}
                />
                <FormInput
                    label="Date of Birth"
                    type="date"
                    value={form.dob}
                    onChange={(e) => onChange({ ...form, dob: e.target.value })}
                    disabled={disabled}
                />
                <FormInput
                    label="Phone"
                    value={form.phone}
                    onChange={(e) => onChange({ ...form, phone: e.target.value })}
                    placeholder="+91 ..."
                    disabled={disabled}
                />
                <FormInput
                    label="College ID"
                    value={form.collegeId}
                    onChange={(e) => onChange({ ...form, collegeId: e.target.value })}
                    disabled={disabled}
                />
            </div>
        </>
    )
}

interface TeacherFormProps {
    form: TeacherForm
    onChange: (form: TeacherForm) => void
    submitting: boolean
    isEditing: boolean
}

export function TeacherForm({ form, onChange, submitting, isEditing }: TeacherFormProps) {
    return (
        <>
            <TeacherFormFields
                form={form}
                onChange={onChange}
                disabled={submitting || isEditing}
            />
            {!isEditing && (
                <p className="text-xs text-muted-foreground mt-4">
                    An invite email will be sent to the teacher so they can set their password.
                </p>
            )}
        </>
    )
}
