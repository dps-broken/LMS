// /client/src/pages/admin/AdminLogin.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosInstance.post('/api/admin/login', { email, password });
            login(data);
            toast.success('Admin login successful!');
            navigate('/admin');
        } catch (err) {
            const message = err.response?.data?.message || 'An error occurred';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Admin Login</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Admin Email</Form.Label>
                                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </Form.Group>
                            <Button disabled={loading} className="w-100" type="submit">
                                {loading ? 'Logging In...' : 'Log In'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
                <div className="w-100 text-center mt-2">
                    Not an admin? <Link to="/login">Login as Student</Link>
                </div>
            </div>
        </div>
    );
};
export default AdminLogin;

