"use client"

import { Hash, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChannelHeaderProps {
    channelName: string
    showMembers: boolean
    onToggleMembers: () => void
}

export function ChannelHeader({ channelName, showMembers, onToggleMembers }: ChannelHeaderProps) {
    return (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-ui-light-surface dark:bg-ui-dark-surface z-10 w-full shrink-0">
            <div className="flex items-center gap-3">
                <Hash className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{channelName}</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">| Talk about anything!</span>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleMembers}
                    aria-label="Toggle member list"
                    className={`h-9 w-9 rounded-full transition-colors ${showMembers
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                >
                    <Users className="h-[20px] w-[20px]" />
                </Button>

                {/* Search Bar matching stitch header search icon vibe */}
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Search className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}