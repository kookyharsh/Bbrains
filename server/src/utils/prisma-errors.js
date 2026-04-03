export function isDatabaseUnavailableError(error) {
    if (!error) return false;

    if (error.code === 'P1001') return true;

    const driverMessage = String(
        error?.meta?.driverAdapterError?.cause?.message
        || error?.meta?.driverAdapterError?.cause?.originalMessage
        || error?.meta?.driverAdapterError?.message
        || error?.message
        || ''
    ).toLowerCase();

    return driverMessage.includes("can't reach database server")
        || driverMessage.includes('database notreachable')
        || driverMessage.includes('max client connections reached')
        || driverMessage.includes('connection terminated unexpectedly');
}
