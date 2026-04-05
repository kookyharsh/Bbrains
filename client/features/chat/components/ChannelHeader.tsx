"use client"

import { useState } from "react"
import { Hash, Users, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ChatMessageDisplay } from "@/features/chat/hooks/useChatMessages"

interface ChannelHeaderProps {
    channelName: string
    showMembers: boolean
    messageCount: number
    isConnected: boolean
    onToggleMembers: () => void
    onSearch?: (query: string) => void
    searchResults?: ChatMessageDisplay[]
    isSearching?: boolean
    onClearSearch?: () => void
    searchQuery?: string
    onOpenSearch?: () => void
    isSearchOpen?: boolean
}

export function ChannelHeader({ 
    channelName, 
    showMembers, 
    messageCount,
    isConnected,
    onToggleMembers,
    onSearch,
    searchResults,
    isSearching,
    onClearSearch,
    searchQuery,
    onOpenSearch,
    isSearchOpen
}: ChannelHeaderProps) {
    const [draftQuery, setDraftQuery] = useState(searchQuery || "")
    const localQuery = searchQuery ?? draftQuery

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setDraftQuery(value)
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSearch) {
            onSearch(localQuery)
            if (onOpenSearch) onOpenSearch()
        }
    }

    const handleClearSearch = () => {
        setDraftQuery("")
        if (onClearSearch) {
            onClearSearch()
        }
        if (onOpenSearch && isSearchOpen) {
            onOpenSearch()
        }
    }

    return (
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card rounded-t-lg shrink-0 z-10">
            <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">{channelName}</h2>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{messageCount} messages</Badge>
                <div 
                    className={`h-2 w-2 rounded-full ml-1 ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} 
                    title={isConnected ? 'Connected' : 'Disconnected'} 
                />
            </div>

            <div className="flex items-center gap-2">
                <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                        value={localQuery}
                        onChange={handleSearchChange}
                        placeholder="Search messages..."
                        className="bg-background border border-input rounded-md pl-7 pr-8 py-1 text-xs outline-none focus:ring-1 focus:ring-ring w-32 md:w-40 placeholder:text-muted-foreground"
                    />
                    {localQuery && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </form>

                {isSearchOpen && (
                    <div className="fixed inset-0 z-50 bg-background/95 flex items-start pt-16 px-4">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={localQuery}
                                onChange={handleSearchChange}
                                placeholder="Search messages..."
                                autoFocus
                                className="bg-background border border-input rounded-lg pl-10 pr-10 py-2 text-sm w-full placeholder:text-muted-foreground"
                            />
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}

                {!isSearchOpen && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="sm:hidden h-8 w-8 p-0"
                        onClick={onOpenSearch}
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                )}
                
                {isSearching && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">Searching...</span>
                )}
                
                {searchResults && searchResults.length > 0 && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">{searchResults.length} results</span>
                )}
                
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleMembers}
                    className={`h-8 gap-1.5 ${showMembers ? "bg-muted" : ""}`}
                >
                    <Users className="h-4 w-4" />
                    <span className="hidden md:inline text-xs">Members</span>
                </Button>
            </div>
        </div>
    )
}
