"use client";

import React from "react";
import { FormInput, FormSelect } from "@/features/admin/components/form";
import type { ManagerForm as ManagerFormType } from "../_types";

interface ManagerFormProps {
  form: ManagerFormType;
  onChange: (form: ManagerFormType) => void;
  disabled?: boolean;
}

export function ManagerForm({ form, onChange, disabled }: ManagerFormProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormInput
        label="Username"
        required
        value={form.username}
        onChange={(e) => onChange({ ...form, username: e.target.value })}
        placeholder="manager_username"
        disabled={disabled}
      />
      <FormInput
        label="Email"
        required
        type="email"
        value={form.email}
        onChange={(e) => onChange({ ...form, email: e.target.value })}
        placeholder="manager@school.edu"
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
      <div className="col-span-2">
        <FormInput
          label="Bio"
          value={form.bio}
          onChange={(e) => onChange({ ...form, bio: e.target.value })}
          placeholder="Brief note about the manager"
          disabled={disabled}
        />
      </div>
      <p className="col-span-2 text-xs text-muted-foreground">
        This creates a live staff account and assigns the custom Manager role immediately.
      </p>
    </div>
  );
}
