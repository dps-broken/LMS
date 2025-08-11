import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.jsx';

const OTPVerification = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const email = location.state?.email;

    if (!email) { /* ... logic ... */ }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosInstance.post('/api/auth/verify-otp', { email, otp });
            login(data);
            toast.success('Account verified successfully!');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="auth-page-container">
            <div className="auth-form-panel">
                <div className="auth-form-wrapper-glass">
                    <h2>Verify Your Account</h2>
                    <p>A 6-digit One-Time Password (OTP) has been sent to <strong>{email}</strong>.</p>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Control type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="Enter OTP" className="form-control-glass" />
                        </Form.Group>
                        <Button disabled={loading} className="w-100 btn-glow" type="submit">
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;