"use client"

import React from "react"
import { FormInput, FormSelect, FormTextarea } from "@/features/admin/components/form"
import type { TeacherForm } from "../_types"
import type { Course } from "@/services/api/client"

interface TeacherFormFieldsProps {
    form: TeacherForm
    onChange: (form: TeacherForm) => void
    disabled?: boolean
    showPasswordFields?: boolean
    courses: Course[]
    isEditing?: boolean
}

export function TeacherFormFields({ form, onChange, disabled, showPasswordFields, courses, isEditing }: TeacherFormFieldsProps) {
    const classTeacherOptions = [
        { value: "", label: "No class teacher assignment" },
        ...courses.map((course) => ({
            value: String(course.id),
            label: `${course.name}${course.standard ? ` (${course.standard})` : ""}${course.classTeacherId && String(course.id) !== form.classTeacherCourseId ? " — already assigned" : ""}`,
        })),
    ]

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <FormInput
                    label="Username"
                    required
                    value={form.username}
                    onChange={(e) => onChange({ ...form, username: e.target.value })}
                    placeholder="username"
                    disabled={disabled || isEditing}
                />
                <FormInput
                    label="Email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => onChange({ ...form, email: e.target.value })}
                    placeholder="email@domain.com"
                    disabled={disabled || isEditing}
                />
                {showPasswordFields && (
                    <>
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
                    </>
                )}
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
                <FormSelect
                    label="Class Teacher Of"
                    value={form.classTeacherCourseId}
                    onChange={(v) => onChange({ ...form, classTeacherCourseId: v })}
                    options={classTeacherOptions}
                    disabled={disabled}
                />
                <div className="col-span-2">
                    <FormTextarea
                        label="Subjects"
                        required
                        value={form.teacherSubjectsText}
                        onChange={(value) => onChange({ ...form, teacherSubjectsText: value })}
                        placeholder={`Add one subject per line\nMathematics\nPhysics\nChemistry`}
                        rows={4}
                        disabled={disabled}
                    />
                </div>
            </div>
        </>
    )
}

interface TeacherFormProps {
    form: TeacherForm
    onChange: (form: TeacherForm) => void
    submitting: boolean
    isEditing: boolean
    courses: Course[]
}

export function TeacherForm({ form, onChange, submitting, isEditing, courses }: TeacherFormProps) {
    return (
        <>
            <TeacherFormFields
                form={form}
                onChange={onChange}
                disabled={submitting}
                showPasswordFields={!isEditing}
                courses={courses}
                isEditing={isEditing}
            />
            {!isEditing && (
                <p className="text-xs text-muted-foreground mt-4">
                    This creates a live login account immediately. Share the temporary password with the teacher or have them reset it after first sign-in.
                </p>
            )}
        </>
    )
}
