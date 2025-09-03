// Types shared across components

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

export interface RequestHistory {
    id: number
    method: HttpMethod
    url: string
    owner?: string | null
    requestHeaders?: unknown
    responseHeaders?: unknown
    requestBody?: string | null
    responseBody?: string | null
    requestBodyType?: "json" | "text" | "binary" | null
    responseBodyType?: "json" | "text" | "binary" | "html" | null
    status: number
    createdAt: string | Date
}

export interface HistoryResponse {
    records: RequestHistory[]
    total: number
    page: number
    limit: number
}

export interface RequestPayload {
    method: HttpMethod
    url: string
    headers?: Record<string, string>
    body?: any
}
