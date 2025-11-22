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
            <main className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`}>
                {!isSidebarOpen && (
                    <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Show Sidebar">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                )}
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
