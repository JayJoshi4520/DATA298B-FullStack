import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './MainLayout.scss';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="main-layout">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`} style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden' }}>
                {!isSidebarOpen && (
                    <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Show Sidebar">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
