import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useChat } from '../../ChatContext';
import { ProviderSelector } from '../ChatPanel/ProviderSelector';
import { SessionSidebar } from '../ChatPanel/SessionSidebar';
import { Dropdown, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './Sidebar.scss';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showSessionSidebar, setShowSessionSidebar] = useState(false);
    const { newSession, sessions, messages } = useChat();
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

    return (
        <aside className={`sidebar ${!isOpen ? 'hidden' : ''} ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand">
                    <span className="material-symbols-outlined brand-icon">smart_toy</span>
                    <span className="brand-text">Agentic IDE</span>
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
