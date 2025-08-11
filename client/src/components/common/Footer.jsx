// /client/src/components/common/Footer.js
import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="footer mt-auto py-3" style={{backgroundColor: 'var(--surface-color)'}}>
            <Container>
                <span className="text-muted">© {new Date().getFullYear()} Pixel Push Software Agency. All rights reserved.</span>
            </Container>
        </footer>
    );
};
export default Footer;

