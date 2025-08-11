// /client/src/components/common/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

const NotFound = () => {
  return (
    <Container className="text-center d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button as={Link} to="/" variant="primary">Go to Home</Button>
    </Container>
  );
};
export default NotFound;

