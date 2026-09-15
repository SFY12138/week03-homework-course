import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const Summary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('获取学习总结失败');
      }
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      message.error('获取学习总结失败');
      console.error('获取学习总结错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success('代码已复制到剪贴板');
  };

  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');
    
    return !inline && match ? (
      <div style={{ position: 'relative', margin: '16px 0' }}>
        <pre className={className} {...props}>
          <code>{children}</code>
        </pre>
        <button
          onClick={() => handleCopyCode(code)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          复制
        </button>
      </div>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  if (loading) {
    return <Spin size="large" style={{ margin: '200px auto' }} />;
  }

  return (
    <div>
      <h1 style={{ textAlign: 'left', marginBottom: 24 }}>学习总结</h1>
      
      <Card>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code: CodeBlock
          }}
        >
          {content}
        </ReactMarkdown>
      </Card>
    </div>
  );
};

export default Summary;