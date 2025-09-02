import { useState } from 'react';
import { RequestForm } from '@/components/RequestForm';
import { ResponseDisplay } from '@/components/ResponseDisplay';
import { RequestHistory } from '@/components/RequestHistory';
import { ApiService, RequestData, RequestHistoryItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RequestHistoryItem | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleRequest = async (requestData: RequestData) => {
    setLoading(true);
    try {
      const result = await ApiService.makeRequest(requestData);
      setResponse(result);
      setHistoryRefreshKey(prev => prev + 1); // Trigger history refresh
      toast({
        title: "Request completed",
        description: `${requestData.method} ${requestData.url} - ${result.status}`,
      });
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">API Tester</h1>
          <p className="text-muted-foreground">Test REST APIs with ease</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Form */}
          <div className="lg:col-span-2">
            <RequestForm onSubmit={handleRequest} loading={loading} />
            {response && <ResponseDisplay response={response} />}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <RequestHistory 
              key={historyRefreshKey} 
              onSelectRequest={setResponse}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;