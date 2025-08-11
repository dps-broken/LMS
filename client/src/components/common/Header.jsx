import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { FaUserCircle, FaBars } from 'react-icons/fa'; // Hamburger icon

const Header = ({ toggleSidebar }) => {
    const { userInfo, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const profileLink = userInfo?.role === 'admin' ? '/admin/profile' : '/profile';

    return (
        // Apply the new glassmorphism header class and make it dark-themed
        <Navbar expand="lg" className="header-glass bg-dark" variant="dark">
            <Container fluid>
                {/* Hamburger button, only visible on screens smaller than large */}
                <Button 
                    variant="outline-secondary" 
                    onClick={toggleSidebar} 
                    className="d-lg-none me-2" // Bootstrap class to hide on large screens and up
                >
                    <FaBars />
                </Button>

                <Navbar.Brand as={Link} to={userInfo?.role === 'admin' ? '/admin' : '/'} className="fw-bold gradient-text-custom">
                   Pixel Push Software Agency
                </Navbar.Brand>

                {/* The rest of the nav is now pushed to the end */}
                <Nav className="ms-auto align-items-center">
                    {userInfo ? (
                        <NavDropdown 
                            title={<FaUserCircle size={24} />} 
                            id="basic-nav-dropdown"
                            align="end" // Aligns the dropdown to the right
                        >
                            <NavDropdown.Header>Signed in as<br/><strong>{userInfo.fullName}</strong></NavDropdown.Header>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to={profileLink}>Profile</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    ) : (
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    )}
                </Nav>
            </Container>
        </Navbar>
    );
};

export default Header;