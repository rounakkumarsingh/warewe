// Small helpers for safe parsing and binary downloads

// Safely parse JSON; returns { value, error }
export function safeJSONParse<T = unknown>(input: string): { value?: T; error?: string } {
    try {
        const value = JSON.parse(input) as T
        return { value }
    } catch (e: any) {
        return { error: e?.message || "Invalid JSON" }
    }
}

// Pretty print any unknown JSON-ish structure
export function pretty(obj: unknown): string {
    try {
        return JSON.stringify(obj, null, 2)
    } catch {
        return String(obj)
    }
}

export function formatDate(dt: string | Date): string {
    const d = typeof dt === "string" ? new Date(dt) : dt
    if (Number.isNaN(d.getTime())) return String(dt)
    return d.toLocaleString()
}

// Convert base64 string to a Blob
export function base64ToBlob(base64: string, contentType = "application/octet-stream"): Blob {
    // Handle potential "data:*/*;base64," prefix
    const clean = base64.includes(",") ? base64.split(",").pop() || "" : base64
    const byteChars = atob(clean)
    const byteNumbers = new Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: contentType })
}

// Download a base64 payload
export function downloadBase64(base64: string, filename = "response.bin", contentType?: string) {
    const blob = base64ToBlob(base64, contentType)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}
