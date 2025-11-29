import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useChat } from '../../ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ProviderSelector } from '../ChatPanel/ProviderSelector';
import { SessionSidebar } from '../ChatPanel/SessionSidebar';
import { Dropdown, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './Sidebar.scss';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showSessionSidebar, setShowSessionSidebar] = useState(false);
    const { newSession, sessions, messages } = useChat();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', icon: 'chat', label: 'Chat' },
        { path: '/multi-agent', icon: 'hub', label: 'Multi-Agent Studio' },
        { path: '/dashboard', icon: 'monitoring', label: 'Memory Dashboard' },
    ];

    const exportConversation = (format) => {
        if (messages.length === 0) {
            toast.warning('No conversation to export');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        let content = '';
        let filename = '';

        if (format === 'json') {
            content = JSON.stringify(messages, null, 2);
            filename = `conversation-${timestamp}.json`;
        } else if (format === 'markdown') {
            content = messages.map(m => {
                const time = new Date(m.timestamp).toLocaleString();
                return `### ${m.role === 'user' ? '👤 You' : '🤖 Immortal'} - ${time}\n\n${m.content}\n\n---\n`;
            }).join('\n');
            filename = `conversation-${timestamp}.md`;
        } else if (format === 'txt') {
            content = messages.map(m => {
                const time = new Date(m.timestamp).toLocaleString();
                return `[${time}] ${m.role === 'user' ? 'You' : 'Immortal'}: ${m.content}\n\n`;
            }).join('');
            filename = `conversation-${timestamp}.txt`;
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`✅ Conversation exported as ${format.toUpperCase()}`);
    };

    const exportToPDF = () => {
        if (messages.length === 0) {
            toast.warning('No conversation to export');
            return;
        }

        const timestamp = new Date().toLocaleString();
        
        // Create styled HTML content for PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Immortal AI - Conversation Export</title>
                <style>
                    * { box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 40px 20px;
                        background: white;
                        color: #1e293b;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #6366f1;
                    }
                    .header h1 {
                        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 0 0 10px 0;
                        font-size: 28px;
                    }
                    .header p {
                        color: #64748b;
                        margin: 0;
                        font-size: 14px;
                    }
                    .message {
                        margin-bottom: 24px;
                        padding: 16px;
                        border-radius: 12px;
                        page-break-inside: avoid;
                    }
                    .message.user {
                        background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
                        border-left: 4px solid #3b82f6;
                    }
                    .message.assistant {
                        background: linear-gradient(135deg, #faf5ff 0%, #fdf4ff 100%);
                        border-left: 4px solid #8b5cf6;
                    }
                    .message-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 12px;
                        font-weight: 600;
                        color: #475569;
                    }
                    .message-header .role {
                        font-size: 16px;
                    }
                    .message-header .time {
                        margin-left: auto;
                        font-size: 12px;
                        color: #94a3b8;
                        font-weight: normal;
                    }
                    .message-content {
                        color: #334155;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    .message-content code {
                        background: #f1f5f9;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-family: 'SF Mono', Monaco, monospace;
                        font-size: 13px;
                    }
                    .message-content pre {
                        background: #1e293b;
                        color: #e2e8f0;
                        padding: 16px;
                        border-radius: 8px;
                        overflow-x: auto;
                        font-size: 13px;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e2e8f0;
                        text-align: center;
                        color: #94a3b8;
                        font-size: 12px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .message { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🤖 Immortal AI</h1>
                    <p>Conversation Export • ${timestamp}</p>
                    <p>${messages.length} messages</p>
                </div>
                ${messages.map(m => {
                    const time = new Date(m.timestamp).toLocaleString();
                    const role = m.role === 'user' ? '👤 You' : '🤖 Immortal AI';
                    // Escape HTML and convert code blocks
                    let content = m.content
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
                        .replace(/`([^`]+)`/g, '<code>$1</code>');
                    return '<div class="message ' + m.role + '">' +
                        '<div class="message-header">' +
                        '<span class="role">' + role + '</span>' +
                        '<span class="time">' + time + '</span>' +
                        '</div>' +
                        '<div class="message-content">' + content + '</div>' +
                        '</div>';
                }).join('')}
                <div class="footer">
                    <p>Generated by Immortal AI • Multi-Agent Development Platform</p>
                </div>
            </body>
            </html>
        `;

        // Open print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Wait for content to load then trigger print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    // Don't close automatically - let user save as PDF
                }, 250);
            };
            
            toast.info('📄 PDF export opened - use "Save as PDF" in print dialog');
        } else {
            toast.error('❌ Please allow popups to export PDF');
        }
    };

    return (
        <aside className={`sidebar ${!isOpen ? 'hidden' : ''} ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand">
                    <span className="material-symbols-outlined brand-icon">smart_toy</span>
                    <span className="brand-text">Immortal AI</span>
                </div>
                <button className="collapse-btn" onClick={toggleSidebar}>
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
            </div>

            <div className="px-3 mb-3 mt-2">
                <NavLink to="/" onClick={newSession} className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 new-chat-btn">
                    <span className="material-symbols-outlined">add</span>
                    {!collapsed && <span>New Chat</span>}
                </NavLink>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        end={item.path === '/'}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                    </NavLink>
                ))}

                {/* Sessions Button */}
                <button className="nav-link" onClick={() => setShowSessionSidebar(true)}>
                    <span className="material-symbols-outlined">history</span>
                    <span className="nav-text">Sessions {sessions.length > 0 && `(${sessions.length})`}</span>
                </button>

                {/* Model Provider */}
                {!collapsed && (
                    <div className="px-2 py-2">
                        <ProviderSelector />
                    </div>
                )}

                {/* Export Dropdown */}
                {!collapsed && (
                    <div className="px-2 py-2">
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" className="w-100" id="sidebar-export-dropdown">
                                <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '1rem' }}>download</span>
                                Export
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-lg border-0" style={{ background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(12px)' }}>
                                <Dropdown.Item onClick={() => exportToPDF()} className="text-light">
                                    📕 PDF Document
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => exportConversation('json')} className="text-light">
                                    📄 JSON Format
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => exportConversation('markdown')} className="text-light">
                                    📝 Markdown Format
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => exportConversation('txt')} className="text-light">
                                    📋 Plain Text
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                )}

                {/* Theme Toggle */}
                {!collapsed && (
                    <div className="px-2 py-2">
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={toggleTheme}
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            <span style={{ fontSize: '1.1rem' }}>{isDarkMode ? '🌙' : '☀️'}</span>
                            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </Button>
                    </div>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
                    <div className="avatar">
                        {collapsed ? <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>menu_open</span> : 'U'}
                    </div>
                    {!collapsed && <span className="nav-text">Collapse View</span>}
                </div>
            </div>

            {/* Session Sidebar */}
            <SessionSidebar show={showSessionSidebar} onHide={() => setShowSessionSidebar(false)} />
        </aside>
    );
};

export default Sidebar;
