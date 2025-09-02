export interface RequestData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface RequestHistoryItem {
  id: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  requestHeaders?: object;
  responseHeaders?: object;
  requestBody?: string;
  responseBody?: string;
  requestBodyType?: 'json' | 'text' | 'binary';
  responseBodyType?: 'json' | 'text' | 'binary';
  status: number;
  createdAt: string;
}

export interface HistoryResponse {
  records: RequestHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export class ApiService {
  private static baseUrl = '/api';

  static async makeRequest(requestData: RequestData): Promise<RequestHistoryItem> {
    const response = await fetch(`${this.baseUrl}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getHistory(page: number = 1, limit: number = 10): Promise<HistoryResponse> {
    const response = await fetch(`${this.baseUrl}/history?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    return response.json();
  }
}

export const formatHeaders = (headers: object | undefined): string => {
  if (!headers) return '';
  try {
    return JSON.stringify(headers, null, 2);
  } catch {
    return String(headers);
  }
};

export const formatBody = (
  body: string | undefined, 
  bodyType: 'json' | 'text' | 'binary' | undefined
): { content: string; isBinary: boolean } => {
  if (!body) return { content: '', isBinary: false };

  if (bodyType === 'binary') {
    return { content: 'Binary data (base64)', isBinary: true };
  }

  if (bodyType === 'json') {
    try {
      const parsed = JSON.parse(body);
      return { content: JSON.stringify(parsed, null, 2), isBinary: false };
    } catch {
      return { content: body, isBinary: false };
    }
  }

  return { content: body, isBinary: false };
};

export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return 'text-status-success';
  if (status >= 300 && status < 400) return 'text-status-redirect';
  if (status >= 400 && status < 500) return 'text-status-client-error';
  if (status >= 500) return 'text-status-server-error';
  return 'text-foreground';
};

export const getMethodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'GET': return 'text-method-get';
    case 'POST': return 'text-method-post';
    case 'PUT': return 'text-method-put';
    case 'DELETE': return 'text-method-delete';
    case 'PATCH': return 'text-method-patch';
    default: return 'text-foreground';
  }
};