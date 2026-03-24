"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/services/api/client"
import { Loader2, XCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { ApiUser, ApiRole } from "@/lib/types/api"

interface UserRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  username: string;
}

export function UserRolesDialog({ open, onOpenChange, userId, username }: UserRolesDialogProps) {
  const [allRoles, setAllRoles] = useState<ApiRole[]>([])
  const [userRoles, setUserRoles] = useState<ApiRole[]>([])
  const [loading, setLoading] = useState(false)
  const [assignRoleId, setAssignRoleId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const [rolesRes, userRolesRes] = await Promise.all([
        api.get<ApiRole[]>("/roles"),
        api.get<{ role: ApiRole }[]>(`/roles/users/${userId}`)
      ])

      if (rolesRes.success) setAllRoles(rolesRes.data || [])
      if (userRolesRes.success) {
        setUserRoles((userRolesRes.data || []).map(ur => ur.role))
      }
    } catch (error) {
      console.error("Failed to load roles:", error)
      toast.error("Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && userId) {
      loadData()
    }
  }, [open, userId])

  const handleAssign = async () => {
    if (!userId || !assignRoleId) return
    try {
      setSubmitting(true)
      const res = await api.post(`/roles/users/${userId}/assign`, { roleId: Number(assignRoleId) })
      if (res.success) {
        toast.success("Role assigned")
        await loadData()
        setAssignRoleId("")
      } else {
        toast.error(res.message || "Failed to assign role")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (roleId: number) => {
    if (!userId) return
    try {
      setSubmitting(true)
      const res = await api.delete(`/roles/users/${userId}/${roleId}`)
      if (res.success) {
        toast.success("Role removed")
        setUserRoles(prev => prev.filter(r => r.id !== roleId))
      } else {
        toast.error(res.message || "Failed to remove role")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const availableRoles = allRoles.filter(r => !userRoles.some(ur => ur.id === r.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Manage Roles: @{username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Roles */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Roles</h4>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading roles...
              </div>
            ) : userRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No custom roles assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userRoles.map((role) => (
                  <Badge key={role.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 group">
                    {role.name}
                    <button
                      onClick={() => handleRemove(role.id)}
                      disabled={submitting}
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded-full hover:bg-destructive/10"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Assign New Role */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign New Role</h4>
            <div className="flex gap-2">
              <Select value={assignRoleId} onValueChange={setAssignRoleId} disabled={loading || availableRoles.length === 0}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={availableRoles.length === 0 ? "No roles available" : "Select a role..."} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAssign} 
                disabled={!assignRoleId || submitting} 
                className="shrink-0"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
