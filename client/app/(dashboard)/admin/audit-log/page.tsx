import { AuditLogClient } from "./AuditLogClient"
import { fetchAuditLogs } from "./data"

export default async function AuditLogPage() {
    const initialLogs = await fetchAuditLogs()

    return <AuditLogClient initialLogs={initialLogs} />
}
