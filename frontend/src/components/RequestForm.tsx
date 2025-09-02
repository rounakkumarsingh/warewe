import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestData, getMethodColor } from '@/lib/api';
import { Send, Code, Globe, Hash, FileText } from 'lucide-react';

interface RequestFormProps {
  onSubmit: (data: RequestData) => void;
  loading: boolean;
}

export const RequestForm = ({ onSubmit, loading }: RequestFormProps) => {
  const [method, setMethod] = useState<RequestData['method']>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedHeaders: Record<string, string> | undefined;
    try {
      parsedHeaders = headers.trim() ? JSON.parse(headers) : undefined;
    } catch (error) {
      alert('Invalid JSON in headers');
      return;
    }

    let parsedBody: any;
    if (body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }
    }

    onSubmit({
      method,
      url,
      headers: parsedHeaders,
      body: parsedBody,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Request Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Method and URL */}
          <div className="flex gap-2">
            <div className="w-32">
              <Label htmlFor="method">Method</Label>
              <Select value={method} onValueChange={(value: RequestData['method']) => setMethod(value)}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">
                    <span className={getMethodColor('GET')}>GET</span>
                  </SelectItem>
                  <SelectItem value="POST">
                    <span className={getMethodColor('POST')}>POST</span>
                  </SelectItem>
                  <SelectItem value="PUT">
                    <span className={getMethodColor('PUT')}>PUT</span>
                  </SelectItem>
                  <SelectItem value="DELETE">
                    <span className={getMethodColor('DELETE')}>DELETE</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                required
              />
            </div>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <Label htmlFor="headers" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Headers (JSON)
            </Label>
            <Textarea
              id="headers"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              className="code-block font-mono text-sm min-h-20"
            />
          </div>

          {/* Body */}
          {(method === 'POST' || method === 'PUT') && (
            <div className="space-y-2">
              <Label htmlFor="body" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Request Body
              </Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="code-block font-mono text-sm min-h-32"
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};