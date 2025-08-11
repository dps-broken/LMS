import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    // We use 'step' to control which part of the form is visible
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * Step 1: Handle submitting the user's email to get an OTP.
     */
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosInstance.post('/api/auth/forgot-password', { email });
            toast.success(data.message);
            setStep(2); // Move to the next step on success
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to send OTP.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Step 2: Handle submitting the OTP and new password to finalize the reset.
     */
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosInstance.post('/api/auth/reset-password', { email, otp, password });
            toast.success(data.message);
            navigate('/login'); // Redirect to login page on final success
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to reset password.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };
    
    // Renders the form for Step 1 (Email Input)
    const renderEmailStep = () => (
        <>
            <p>Enter your email address and we will send you an OTP to reset your password.</p>
            <Form onSubmit={handleEmailSubmit}>
                <Form.Group className="mb-4">
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email Address"
                        className="form-control-glass"
                    />
                </Form.Group>
                <Button disabled={loading} className="w-100 btn-glow" type="submit">
                    {loading ? 'Sending...' : 'Send OTP'}
                </Button>
            </Form>
        </>
    );

    // Renders the form for Step 2 (OTP and New Password Input)
    const renderResetStep = () => (
        <>
            <p>An OTP has been sent to <strong>{email}</strong>. Please enter it below along with your new password.</p>
            <Form onSubmit={handleResetSubmit}>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        placeholder="6-Digit OTP"
                        className="form-control-glass"
                    />
                </Form.Group>
                <Form.Group className="mb-4">
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="New Password (min. 8 characters)"
                        className="form-control-glass"
                    />
                </Form.Group>
                <Button disabled={loading} className="w-100 btn-glow" type="submit">
                    {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
            </Form>
        </>
    );

    return (
        <div className="auth-page-container">
            <div className="auth-form-panel">
                <div className="auth-form-wrapper-glass">
                    <h2>Reset Password</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {step === 1 ? renderEmailStep() : renderResetStep()}

                    <div className="auth-footer">
                        Remember your password? <Link to="/login">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;