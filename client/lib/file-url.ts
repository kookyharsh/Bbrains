"use client"

import { getBaseUrl } from "@/services/api/client"

export function resolveApiFileUrl(fileUrl: string | null | undefined) {
  const normalized = String(fileUrl ?? "").trim()
  if (!normalized) return ""

  if (/^(https?:|data:|blob:)/i.test(normalized)) {
    return normalized
  }

  const baseUrl = getBaseUrl().replace(/\/$/, "")
  const relativePath = normalized.startsWith("/") ? normalized : `/${normalized}`
  return `${baseUrl}${relativePath}`
}

export function getFileUrlBase(url: string) {
  return resolveApiFileUrl(url).split(/[?#]/)[0]?.toLowerCase() ?? ""
}
