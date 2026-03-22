import type { SystemConfig } from "@/lib/api-services"

import { ToggleLeft, Hash, Braces, Type } from "lucide-react"
import React, { type ReactNode } from "react"

export type ConfigType = "string" | "number" | "boolean" | "json";

export interface ConfigFormData {
    key: string;
    value: string;
    type: ConfigType;
    description: string;
}

export function getInitFormData(): ConfigFormData {
    return {
        key: "",
        value: "",
        type: "string",
        description: "",
    }
}

export function getInitFormDataFromConfig(config: SystemConfig): ConfigFormData {
    return {
        key: config.key,
        value: String(config.value),
        type: config.type as ConfigType,
        description: config.description || "",
    }
}

export function getTypeIcon(type: string): ReactNode {
    switch (type) {
        case "boolean":
            return React.createElement(ToggleLeft, { className: "size-3 mr-1" })
        case "number":
            return React.createElement(Hash, { className: "size-3 mr-1" })
        case "json":
            return React.createElement(Braces, { className: "size-3 mr-1" })
        default:
            return React.createElement(Type, { className: "size-3 mr-1" })
    }
}
