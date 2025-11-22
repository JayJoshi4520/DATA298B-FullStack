import { IdePlaceholder } from "./IdePlaceholder";
import { useTabs } from "../../TabContext";
import "./ExternalContentPanel.scss";
import { ExternalTabs } from "./ExternalTabs";
import { useRef, useState, useEffect } from "react";
import { Card, Button, ButtonGroup, Spinner } from "react-bootstrap";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";

export function ExternalContentPanel() {
  const { tabs, setActiveTab, activeTab, addTab, removeTab } = useTabs();
  const iframeRef = useRef();
  const [viewMode, setViewMode] = useState('iframe'); // 'iframe' or 'code'
  const [fileContent, setFileContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);

  // Detect language from URL
  const detectLanguage = (url) => {
    if (!url) return 'text';
    const ext = url.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sh': 'bash',
      'sql': 'sql',
    };
    return langMap[ext] || 'text';
  };

  // Load file content for code view
  useEffect(() => {
    const loadFileContent = async () => {
      if (viewMode === 'code' && activeTab) {
        setLoading(true);
        try {
          // Try to fetch as text
          const response = await fetch(activeTab);
          const text = await response.text();
          setFileContent(text);
          setLanguage(detectLanguage(activeTab));
        } catch (err) {
          console.error('Failed to load file:', err);
          toast.error('❌ Failed to load file for preview');
          setViewMode('iframe');
        } finally {
          setLoading(false);
        }
      }
    };

    loadFileContent();
  }, [viewMode, activeTab]);

  const copyCode = () => {
    navigator.clipboard.writeText(fileContent);
    toast.success('✅ Code copied to clipboard');
  };

  return (
    <div className="d-flex flex-fill flex-column">
      <div className="p-3 pt-2 pb-0 ecp-header">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <ExternalTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
            onTabRemoval={removeTab}
            onRefreshClick={() => {
              if (viewMode === 'iframe' && iframeRef.current) {
                const url = new URL(iframeRef.current.src);
                url.searchParams.set("t", Date.now());
                iframeRef.current.src = url.toString();
              }
            }}
          />
        </div>
      </div>
      {activeTab ? (
        viewMode === 'iframe' ? (
          <iframe
            ref={iframeRef}
            style={{ flex: 1, border: "none" }}
            src={activeTab}
          />
        ) : (
          <div style={{ flex: 1, overflow: 'auto', background: '#1e1e1e', padding: '0' }}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" variant="light" />
              </div>
            ) : (
              <Card style={{ margin: 0, background: 'transparent', border: 'none' }}>
                <Card.Header style={{ background: '#2d2d30', border: 'none', color: 'white' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="me-2">📄</span>
                      <strong>{activeTab.split('/').pop()}</strong>
                      <span className="ms-2 badge bg-secondary">{language}</span>
                    </div>
                    <ButtonGroup size="sm">
                      <Button variant="outline-light" onClick={copyCode}>
                        📋 Copy
                      </Button>
                    </ButtonGroup>
                  </div>
                </Card.Header>
                <Card.Body style={{ padding: 0 }}>
                  <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    showLineNumbers={true}
                    wrapLines={true}
                    lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', userSelect: 'none', opacity: 0.5 }}
                    customStyle={{
                      margin: 0,
                      padding: '1em',
                      fontSize: '0.9em',
                      background: '#1e1e1e',
                    }}
                  >
                    {fileContent || '// No content'}
                  </SyntaxHighlighter>
                </Card.Body>
              </Card>
            )}
          </div>
        )
      ) : (
        <IdePlaceholder
          onLaunch={() => addTab("http://localhost:8085", "Workspace")}
        />
      )}
    </div>
  );
}
