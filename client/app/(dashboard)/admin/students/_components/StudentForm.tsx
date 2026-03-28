"use client"

import React from "react"
import { FormInput, FormSelect } from "@/features/admin/components/form"
import type { StudentForm as StudentFormType } from "../_types"

interface StudentFormProps {
    form: StudentFormType
    onChange: (form: StudentFormType) => void
    disabled?: boolean
}

export function StudentForm({ form, onChange, disabled }: StudentFormProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <FormInput
                label="Username"
                required
                value={form.username}
                onChange={(e) => onChange({ ...form, username: e.target.value })}
                placeholder="student_username"
                disabled={disabled}
            />
            <FormInput
                label="Email"
                required
                type="email"
                value={form.email}
                onChange={(e) => onChange({ ...form, email: e.target.value })}
                placeholder="student@school.edu"
                disabled={disabled}
            />
            <FormInput
                label="Temporary Password"
                required
                type="password"
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                placeholder="Minimum 8 characters"
                disabled={disabled}
            />
            <FormInput
                label="Confirm Password"
                required
                type="password"
                value={form.confirmPassword}
                onChange={(e) => onChange({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
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
                onChange={(value) => onChange({ ...form, sex: value })}
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
            <p className="col-span-2 text-xs text-muted-foreground">
                This creates a live student login immediately. Share the temporary password with the student or ask them to reset it after their first sign-in.
            </p>
        </div>
    )
}
