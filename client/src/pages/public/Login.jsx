import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth.jsx';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosInstance.post('/api/auth/login', { email, password });
            login(data);
            toast.success('Logged in successfully!');
            const redirectPath = data.role === 'admin' ? '/admin' : '/';
            navigate(from || redirectPath, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
            toast.error(err.response?.data?.message || 'Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-art-panel">
                {/* Decorative SVG */}
                <svg className="background-lines" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,245.3C672,267,768,277,864,256C960,235,1056,181,1152,160C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    <path fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,149.3C960,171,1056,213,1152,224C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
            <div className="auth-form-panel">
                <div className="auth-form-wrapper-glass">
                    <h2>Platform Login</h2>
                    <p>Welcome back. Please enter your credentials to access your dashboard.</p>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Control type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="form-control-glass"/>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="form-control-glass"/>
                        </Form.Group>
                        <Button disabled={loading} className="w-100 btn-glow" type="submit">
                            {loading ? 'Signing In...' : 'Continue'}
                        </Button>
                    </Form>
                    <div className="auth-links">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                    <div className="auth-footer">
                        Want to join? <Link to="/apply-internship">Apply Here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;