"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, Search, ChevronRight, X, Info, Users, RotateCcw, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/services/api/client"
import type { Permission, Role, UserWithRoles } from "./_types"

interface RolesClientProps {
    initialRoles: Role[]
    initialUsers: UserWithRoles[]
}

export function RolesClient({ initialRoles, initialUsers }: RolesClientProps) {
    const [roles, setRoles] = useState<Role[]>(initialRoles)
    const [users] = useState<UserWithRoles[]>(initialUsers)
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [currentUserRank, setCurrentUserRank] = useState<number>(100)

    const [draggedRole, setDraggedRole] = useState<number | null>(null)
    const [draggedOverRole, setDraggedOverRole] = useState<number | null>(null)

    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(initialRoles[0]?.id || null)
    const [searchRoleQuery, setSearchRoleQuery] = useState("")
    const [searchPermQuery, setSearchPermQuery] = useState("")
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    
    // In a real implementation you might track pending changes.
    // For now, we will save them directly or queue them. 
    // Stitch design shows "Save Changes" at the bottom.
    const [pendingPermissions, setPendingPermissions] = useState<{ [roleId: number]: Set<number> }>({})

    useEffect(() => {
        const loadMatrixMetadata = async () => {
            try {
                const [permsRes, meRes] = await Promise.all([
                    api.get<Permission[]>("/roles/permissions"),
                    api.get<any>("/user/me"),
                ])

                if (permsRes.success) {
                    setPermissions(permsRes.data || [])
                }

                if (meRes.success) {
                    const userData = meRes.data || {}
                    if (userData.isSuperAdmin) {
                        setCurrentUserRank(0)
                    } else if (Array.isArray(userData.roles) && userData.roles.length > 0) {
                        const ranks = userData.roles
                            .map((ur: { role?: { rank?: number } }) => ur.role?.rank)
                            .filter((rank: number | undefined): rank is number => typeof rank === "number")
                        setCurrentUserRank(ranks.length > 0 ? Math.min(...ranks) : 100)
                    }
                }
            } catch (error) {
                console.error("Failed to load permission matrix metadata:", error)
                setPermissions([])
            }
        }

        loadMatrixMetadata()
    }, [])
    
    // Initialize pending permissions from selected role
    useEffect(() => {
        if (selectedRoleId !== null && !pendingPermissions[selectedRoleId]) {
            const role = roles.find(r => r.id === selectedRoleId)
            if (role) {
                const permIds = new Set(role.permissions.map(p => p.permission.id))
                setPendingPermissions(prev => ({
                    ...prev,
                    [selectedRoleId]: permIds
                }))
            }
        }
    }, [selectedRoleId, roles])

    const handleCreateRole = () => {
        toast.info("Create role dialog trigger")
        // Implementation for creating new role
    }

    const filteredRoles = useMemo(() => {
        return roles.filter(r => r.name.toLowerCase().includes(searchRoleQuery.toLowerCase()))
    }, [roles, searchRoleQuery])

    const filteredPermissions = useMemo(() => {
        return permissions.filter(p => 
            p.name.toLowerCase().includes(searchPermQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchPermQuery.toLowerCase()))
        )
    }, [permissions, searchPermQuery])

    const selectedRole = roles.find(r => r.id === selectedRoleId)
    const currentPendingPerms = selectedRoleId !== null ? pendingPermissions[selectedRoleId] : new Set<number>()

    const handleTogglePermission = (permissionId: number) => {
        if (!selectedRoleId) return
        setHasUnsavedChanges(true)
        setPendingPermissions(prev => {
            const current = new Set(prev[selectedRoleId])
            if (current.has(permissionId)) {
                current.delete(permissionId)
            } else {
                current.add(permissionId)
            }
            return {
                ...prev,
                [selectedRoleId]: current
            }
        })
    }

    const handleReset = () => {
        if (!selectedRoleId || !selectedRole) return
        const permIds = new Set(selectedRole.permissions.map(p => p.permission.id))
        setPendingPermissions(prev => ({
            ...prev,
            [selectedRoleId]: permIds
        }))
        setHasUnsavedChanges(false)
    }

    const handleSaveChanges = async () => {
        if (!selectedRoleId) return
        
        try {
            const newPermIds = Array.from(currentPendingPerms || [])
            const res = await api.post<Role>(`/roles/${selectedRoleId}/permissions`, { permissionIds: newPermIds })

            if (!res.success) {
                throw new Error(res.message || res.error || "Failed to update permissions")
            }

            const updatedRole = res.data
            if (!updatedRole) throw new Error("Missing role data in response")

            setRoles((prev) =>
                prev.map((r) => (r.id === selectedRoleId ? { ...r, permissions: updatedRole.permissions } : r))
            )
            setHasUnsavedChanges(false)
            toast.success("Permissions updated successfully")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update permissions"
            toast.error(message)
        }
    }

    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedRole(id)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragEnter = (e: React.DragEvent, id: number) => {
        e.preventDefault()
        if (draggedRole !== null && draggedRole !== id) {
            setDraggedOverRole(id)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleDrop = async (e: React.DragEvent, id: number) => {
        e.preventDefault()
        if (draggedRole === null || draggedRole === id) return

        const draggedIndex = roles.findIndex((r) => r.id === draggedRole)
        const dropIndex = roles.findIndex((r) => r.id === id)

        if (draggedIndex === -1 || dropIndex === -1) return

        const newRoles = [...roles]
        const [removed] = newRoles.splice(draggedIndex, 1)
        newRoles.splice(dropIndex, 0, removed)

        setRoles(newRoles)
        
        try {
            // Uncomment and adjust when the API route for reordering is available.
            // await api.post("/roles/reorder", { roleIds: newRoles.map(r => r.id) })
            toast.success("Roles reordered")
        } catch (err) {
            toast.error("Failed to save role order")
        }

        setDraggedRole(null)
        setDraggedOverRole(null)
    }

    const handleDragEnd = () => {
        setDraggedRole(null)
        setDraggedOverRole(null)
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] w-full gap-6 font-sans">
            <main className="flex-1 bg-admin-surface-container-lowest rounded-xl shadow-[0_12px_32px_-4px_rgba(44,47,48,0.06)] flex flex-col overflow-hidden relative border border-border/50">
                {/* Dashboard Split View */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Role List */}
                    <aside className="w-80 bg-admin-surface-container-low flex flex-col border-r border-admin-surface-container-low/50">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-admin-on-surface-variant tracking-widest uppercase">
                                    Roles — {roles.length} Total
                                </span>
                                <button 
                                    onClick={handleCreateRole}
                                    className="text-admin-primary hover:bg-admin-primary/5 p-1 rounded transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant w-4 h-4" />
                                <input 
                                    value={searchRoleQuery}
                                    onChange={(e) => setSearchRoleQuery(e.target.value)}
                                    type="text" 
                                    placeholder="Search roles" 
                                    className="w-full pl-10 pr-4 py-2 bg-admin-surface-container-lowest rounded-xl text-sm border-none focus:ring-2 focus:ring-admin-primary/20 transition-all text-admin-on-surface" 
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide pb-10">
                            {filteredRoles.map((role) => {
                                const isSelected = role.id === selectedRoleId
                                const isDragged = role.id === draggedRole
                                const isDraggedOver = role.id === draggedOverRole
                                const isSearchActive = searchRoleQuery.length > 0

                                return (
                                    <div 
                                        key={role.id}
                                        draggable={!isSearchActive}
                                        onDragStart={(e) => handleDragStart(e, role.id)}
                                        onDragEnter={(e) => handleDragEnter(e, role.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, role.id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setSelectedRoleId(role.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group ${
                                            isSelected 
                                                ? "bg-admin-surface-container-lowest shadow-sm ring-1 ring-admin-primary/10" 
                                                : "hover:bg-admin-surface-container-high"
                                        } ${isDragged ? "opacity-50 scale-95" : "opacity-100"} ${
                                            isDraggedOver ? "border-t-2 border-admin-primary" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {!isSearchActive && (
                                                <div className="cursor-grab active:cursor-grabbing text-admin-on-surface-variant/30 hover:text-admin-on-surface transition-colors" title="Drag to reorder">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                            )}
                                            <span className={`w-3 h-3 rounded-full ${isSelected ? "bg-admin-primary ring-4 ring-admin-primary/20" : "bg-admin-surface-dim"}`}></span>
                                            <span className={`text-sm ${isSelected ? "font-bold text-admin-on-surface" : "font-semibold text-admin-on-surface-variant"}`}>
                                                {role.name}
                                            </span>
                                        </div>
                                        {isSelected && <ChevronRight className="text-admin-on-surface-variant w-4 h-4" />}
                                    </div>
                                )
                            })}
                        </div>
                    </aside>

                    {/* Right Panel: Role Edit */}
                    {selectedRole ? (
                        <section className="flex-1 flex flex-col bg-admin-surface-container-lowest overflow-hidden">
                            {/* Right Header */}
                            <div className="p-8 pb-0">
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-admin-on-surface-variant tracking-widest uppercase">Edit Role</span>
                                            <span className="w-1 h-1 rounded-full bg-admin-outline-variant"></span>
                                            <span className="text-xs font-semibold text-admin-primary tracking-widest uppercase">ID: {selectedRole.id}</span>
                                        </div>
                                        <h3 className="text-3xl font-black text-admin-on-surface uppercase tracking-tight">{selectedRole.name}</h3>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedRoleId(null)}
                                        className="flex items-center gap-2 bg-admin-surface-container-low px-4 py-2 rounded-xl text-sm font-bold text-admin-on-surface-variant hover:bg-admin-surface-container-high transition-colors"
                                    >
                                        ESC
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Sub Navigation Tabs */}
                                <div className="flex gap-8 border-b border-admin-surface-container-low">
                                    <button className="pb-4 text-sm font-bold text-admin-on-surface-variant hover:text-admin-on-surface transition-colors relative">
                                        Display
                                    </button>
                                    <button className="pb-4 text-sm font-bold text-admin-primary relative">
                                        Permissions
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-admin-primary rounded-t-full"></div>
                                    </button>
                                    <button className="pb-4 text-sm font-bold text-admin-on-surface-variant hover:text-admin-on-surface transition-colors flex items-center gap-2">
                                        Manage Members
                                    </button>
                                </div>
                            </div>

                            {/* Permissions Scroll Content */}
                            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                                <div className="max-w-3xl">
                                    {/* Local Search */}
                                    <div className="relative mb-8">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-on-surface-variant w-5 h-5" />
                                        <input 
                                            value={searchPermQuery}
                                            onChange={(e) => setSearchPermQuery(e.target.value)}
                                            type="text" 
                                            placeholder="Search permissions" 
                                            className="w-full pl-12 pr-6 py-4 bg-admin-surface-container-low rounded-2xl border-none text-admin-on-surface focus:ring-2 focus:ring-admin-primary/20 transition-all placeholder:text-admin-on-surface-variant/50" 
                                        />
                                    </div>

                                    <div className="space-y-10">
                                        {/* Permission Section */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-admin-on-surface-variant tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                                                Role Permissions
                                                <div className="flex-1 h-px bg-admin-surface-container-low"></div>
                                            </h4>
                                            
                                            <div className="space-y-1">
                                                {filteredPermissions.length > 0 ? filteredPermissions.map(perm => {
                                                    const isEnabled = currentPendingPerms?.has(perm.id)
                                                    
                                                    return (
                                                        <div 
                                                            key={perm.id} 
                                                            onClick={() => handleTogglePermission(perm.id)}
                                                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-admin-surface-bright transition-colors cursor-pointer group"
                                                        >
                                                            <div>
                                                                <p className="font-bold text-admin-on-surface">{perm.name}</p>
                                                                <p className="text-sm text-admin-on-surface-variant">{perm.description || `Allows access to ${perm.name}`}</p>
                                                            </div>
                                                            <div className={`w-12 h-6 ${isEnabled ? 'bg-admin-primary' : 'bg-admin-surface-container-high'} rounded-full relative flex items-center px-1 transition-colors duration-200`}>
                                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                                            </div>
                                                        </div>
                                                    )
                                                }) : (
                                                    <div className="text-sm text-admin-on-surface-variant p-4">No permissions found.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Users Section Proxy */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-admin-on-surface-variant tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                                                Users with this Role
                                                <div className="flex-1 h-px bg-admin-surface-container-low"></div>
                                            </h4>
                                            <div className="p-4 bg-admin-surface-container-low/30 rounded-2xl text-center py-10">
                                                <Users className="w-10 h-10 text-admin-outline-variant mb-4 mx-auto" />
                                                <p className="text-admin-on-surface-variant font-medium">Use the "Manage Members" tab to assign this role.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer Actions */}
                            {hasUnsavedChanges && (
                                <div className="p-6 border-t border-admin-surface-container-low flex justify-between items-center bg-white/50 backdrop-blur-md">
                                    <div className="flex items-center gap-2 text-sm text-admin-on-surface-variant bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-lg border border-amber-500/20">
                                        <RotateCcw className="w-4 h-4" />
                                        Careful — you have unsaved changes!
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleReset}
                                            className="px-6 py-2 rounded-xl text-sm font-bold text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-low transition-colors"
                                        >
                                            Reset
                                        </button>
                                        <button 
                                            onClick={handleSaveChanges}
                                            className="px-8 py-3 bg-gradient-to-r from-admin-primary to-admin-primary-container rounded-full text-sm font-black text-white shadow-lg shadow-admin-primary/20 hover:scale-105 transition-transform"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-admin-surface-container-lowest/50">
                            <div className="text-center p-8 bg-admin-surface-container-low/20 rounded-2xl border border-admin-surface-container-low">
                                <Info className="w-12 h-12 text-admin-on-surface-variant/50 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-admin-on-surface mb-2">Select a Role</h3>
                                <p className="text-sm text-admin-on-surface-variant max-w-xs">
                                    Choose a role from the sidebar to view and edit its permissions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
