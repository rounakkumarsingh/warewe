import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RequestHistoryItem, formatHeaders, formatBody, getStatusColor } from '@/lib/api';
import { JsonFormatter } from '@/components/JsonFormatter';
import { Download, Clock, ArrowUpDown } from 'lucide-react';

interface ResponseDisplayProps {
  response: RequestHistoryItem;
}

export const ResponseDisplay = ({ response }: ResponseDisplayProps) => {
  const { content: responseContent, isBinary } = formatBody(response.responseBody, response.responseBodyType);
  
  const downloadBinary = () => {
    if (response.responseBody && response.responseBodyType === 'binary') {
      try {
        const byteCharacters = atob(response.responseBody);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'response-data';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Failed to download binary data:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Response
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(response.status)}>
              {response.status}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(response.createdAt).toLocaleTimeString()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Response Headers */}
        <div>
          <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Headers</h4>
          <pre className="code-block text-xs">
            {formatHeaders(response.responseHeaders) || 'No headers'}
          </pre>
        </div>

        {/* Response Body */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Body</h4>
            {isBinary && (
              <Button
                size="sm"
                variant="outline"
                onClick={downloadBinary}
                className="flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download
              </Button>
            )}
          </div>
          
          {!responseContent ? (
            <div className="code-block text-muted-foreground italic">No response body</div>
          ) : isBinary ? (
            <div className="code-block text-muted-foreground italic">
              Binary data (base64) - Click download to save
            </div>
          ) : response.responseBodyType === 'json' ? (
            <JsonFormatter content={responseContent} />
          ) : (
            <pre className="code-block text-xs whitespace-pre-wrap">{responseContent}</pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
};