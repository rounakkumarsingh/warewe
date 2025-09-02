import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiService, RequestHistoryItem, getMethodColor, getStatusColor } from '@/lib/api';
import { ChevronDown, ChevronRight, History, MoreHorizontal } from 'lucide-react';
import { JsonFormatter } from '@/components/JsonFormatter';

interface RequestHistoryProps {
  onSelectRequest: (request: RequestHistoryItem) => void;
}

export const RequestHistory = ({ onSelectRequest }: RequestHistoryProps) => {
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [pageCache, setPageCache] = useState<Map<number, RequestHistoryItem[]>>(new Map());

  const limit = 10;

  const loadHistory = async (pageNum: number) => {
    if (pageCache.has(pageNum)) {
      const cachedData = pageCache.get(pageNum)!;
      setHistory(pageNum === 1 ? cachedData : [...history, ...cachedData]);
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.getHistory(pageNum, limit);
      const newHistory = pageNum === 1 ? response.records : [...history, ...response.records];
      
      setHistory(newHistory);
      setTotal(response.total);
      setPageCache(prev => new Map(prev).set(pageNum, response.records));
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
    setPage(1);
    setPageCache(new Map());
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadHistory(nextPage);
  };

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatRequestBody = (body: string | undefined, bodyType: string | undefined) => {
    if (!body) return 'No body';
    if (bodyType === 'json') {
      try {
        return JSON.stringify(JSON.parse(body), null, 2);
      } catch {
        return body;
      }
    }
    return body;
  };

  return (
    <Card className="h-fit max-h-[80vh] overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Request History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[60vh] overflow-y-auto">
          {history.length === 0 && !loading ? (
            <div className="p-4 text-center text-muted-foreground">
              No requests yet. Make your first API call!
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <div key={item.id} className="border-b border-border last:border-b-0">
                    <div
                      className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onSelectRequest(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Badge 
                            variant="outline" 
                            className={`${getMethodColor(item.method)} text-xs font-mono`}
                          >
                            {item.method}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(item.status)} text-xs`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(item.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="mt-1">
                        <div className="text-xs text-muted-foreground truncate">
                          {item.url}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3 bg-muted/20">
                        {/* Request Details */}
                        <div>
                          <h5 className="text-xs font-semibold text-muted-foreground mb-1">Request</h5>
                          {item.requestHeaders && (
                            <div className="mb-2">
                              <div className="text-xs text-muted-foreground mb-1">Headers:</div>
                              <pre className="text-xs code-block">
                                {JSON.stringify(item.requestHeaders, null, 2)}
                              </pre>
                            </div>
                          )}
                          {item.requestBody && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Body:</div>
                              {item.requestBodyType === 'json' ? (
                                <JsonFormatter content={formatRequestBody(item.requestBody, item.requestBodyType)} />
                              ) : (
                                <pre className="text-xs code-block">
                                  {formatRequestBody(item.requestBody, item.requestBodyType)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {history.length < total && (
          <div className="p-3 border-border border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <MoreHorizontal className="w-4 h-4 mr-2 animate-pulse" />
                  Loading...
                </>
              ) : (
                `Load More (${history.length}/${total})`
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};