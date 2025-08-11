import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';

const Layout = () => {
    // State to manage the visibility of the sidebar on mobile devices.
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // This function will be passed to the Header (to open) and the Sidebar/Overlay (to close).
    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="page-wrapper">
            {/* Pass state and the toggle function to the Sidebar */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggle={toggleSidebar} 
            />
            
            <div className="main-panel">
                {/* Pass the toggle function to the Header's hamburger button */}
                <Header 
                    toggleSidebar={toggleSidebar} 
                />
                
                {/* When the main content is clicked while the sidebar is open, close it */}
                <main className="main-content" onClick={() => { if (isSidebarOpen) setSidebarOpen(false); }}>
                    <Outlet />
                </main>
                
                <Footer />
            </div>
        </div>
    );
};

export default Layout;