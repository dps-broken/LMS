import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { 
    FiHome, FiUser, FiBookOpen, FiFileText, FiCalendar, 
    FiCheckSquare, FiBriefcase, FiUsers, FiSettings, FiBell, 
    FiEdit, FiClipboard, FiArchive 
} from 'react-icons/fi';
import './Sidebar.css';

const studentLinks = [
    { path: '/', icon: <FiHome />, name: 'Dashboard' },
    { path: '/profile', icon: <FiUser />, name: 'My Profile' },
    { path: '/quizzes', icon: <FiBookOpen />, name: 'Quizzes' },
    { path: '/assessments', icon: <FiEdit />, name: 'Assessments' },
    { path: '/schedule', icon: <FiCalendar />, name: 'Class Schedule' },
    { path: '/attendance', icon: <FiCheckSquare />, name: 'Attendance' },
    { path: '/documents', icon: <FiFileText />, name: 'Documents' },
];

const adminLinks = [
    { path: '/admin', icon: <FiHome />, name: 'Dashboard' },
    { path: '/admin/students', icon: <FiUsers />, name: 'Students' },
    { path: '/admin/applications', icon: <FiBriefcase />, name: 'Applications' },
    { path: '/admin/openings', icon: <FiClipboard />, name: 'Openings' },
    { path: '/admin/quizzes', icon: <FiBookOpen />, name: 'Quizzes' },
    { path: '/admin/assessments', icon: <FiEdit />, name: 'Assessments' },
    { path: '/admin/schedule', icon: <FiCalendar />, name: 'Schedule' },
    { path: '/admin/attendance', icon: <FiCheckSquare />, name: 'Attendance' },
    { path: '/admin/documents', icon: <FiFileText />, name: 'Documents' },
    { path: '/admin/issuance-log', icon: <FiArchive />, name: 'Issuance Log' },
    { path: '/admin/notifications', icon: <FiBell />, name: 'Notifications' },
    { path: '/admin/departments', icon: <FiSettings />, name: 'Departments' },
    { path: '/admin/batches', icon: <FiSettings />, name: 'Batches' },
];

const Sidebar = ({ isOpen, toggle }) => {
    const { userInfo } = useAuth();
    const links = userInfo?.role === 'admin' ? adminLinks : studentLinks;

    const isEnd = (path) => path === '/' || path === '/admin';

    return (
        <>
            {/* The 'show' class is added conditionally based on the isOpen prop */}
            <div className={`sidebar ${isOpen ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <img src="/logo.png" alt="logo" className="sidebar-logo" />
                    <span className="sidebar-title">Degital LMS</span>
                </div>
                <nav className="sidebar-nav">
                    {links.map((link, index) => (
                        <NavLink 
                            to={link.path} 
                            key={index} 
                            className="sidebar-link" 
                            end={isEnd(link.path)}
                            // On mobile, clicking a link will close the sidebar
                            onClick={() => { if (isOpen) toggle(); }}
                        >
                            {link.icon}
                            <span className="sidebar-link-text">{link.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
            
            {/* The overlay is only rendered when the sidebar is open */}
            {isOpen && <div className="sidebar-overlay" onClick={toggle}></div>}
        </>
    );
};

export default Sidebar;