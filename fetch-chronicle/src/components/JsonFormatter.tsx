interface JsonFormatterProps {
  content: string;
}

export const JsonFormatter = ({ content }: JsonFormatterProps) => {
  const formatJsonWithSyntaxHighlight = (jsonString: string) => {
    if (!jsonString) return '';

    try {
      // First, let's try to parse and re-stringify to ensure it's valid JSON
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      
      // Apply syntax highlighting using regex
      return formatted
        .replace(/"([^"]+)"(\s*:)/g, '<span class="json-key">"$1"</span>$2')
        .replace(/:\s*"([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span class="json-number">$1</span>')
        .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');
    } catch (error) {
      // If it's not valid JSON, return as plain text
      return content;
    }
  };

  return (
    <div className="code-block">
      <pre 
        className="text-xs whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ 
          __html: formatJsonWithSyntaxHighlight(content) 
        }}
      />
    </div>
  );
};