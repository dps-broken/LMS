import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const ApplyInternship = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', mobileNumber: '', positionTitle: '', coverLetter: '' });
    const [resumeFile, setResumeFile] = useState(null);
    const [positions, setPositions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const { data } = await axiosInstance.get('/api/public/positions');
                setPositions(data);
            } catch (err) {
                toast.error("Could not load internship positions.");
            }
        };
        fetchPositions();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setResumeFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile) return setError("Resume (PDF) is required.");
        setLoading(true);
        setError('');
        const submissionForm = new FormData();
        submissionForm.append('resume', resumeFile);
        for (const key in formData) {
            submissionForm.append(key, formData[key]);
        }
        try {
            const { data } = await axiosInstance.post('/api/public/internship/apply', submissionForm, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success(data.message);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Application failed.');
        } finally {
            setLoading(false);
        }
    };
    
    if (success) {
        return (
            <div className="auth-page-container">
                <div className="auth-form-panel">
                    <div className="auth-form-wrapper-glass text-center">
                        <h2 className="text-success">Application Submitted!</h2>
                        <p>Thank you for applying. We have received your application and will review it shortly. You will be notified via email if you are selected.</p>
                        <Link to="/login" className="btn btn-glow mt-3">Back to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-container">
            <div className="auth-form-panel">
                <div className="auth-form-wrapper-glass">
                    <h2 className="text-center">Internship Application</h2>
                    <p className="text-center">Submit your details to apply for an open position.</p>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control type="text" name="fullName" required onChange={handleChange} placeholder="Full Name" className="form-control-glass"/></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control type="email" name="email" required onChange={handleChange} placeholder="Email Address" className="form-control-glass"/></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control type="tel" name="mobileNumber" required onChange={handleChange} placeholder="10-Digit Mobile" className="form-control-glass"/></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3">
                                <Form.Select name="positionTitle" value={formData.positionTitle} required onChange={handleChange} className="form-control-glass">
                                    <option value="">Select Position...</option>
                                    {positions.map(p => <option key={p._id} value={p.title}>{p.title}</option>)}
                                </Form.Select>
                            </Form.Group></Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label className="ms-1"><small>Resume/CV (PDF Only)</small></Form.Label>
                            <Form.Control type="file" name="resume" accept=".pdf" required onChange={handleFileChange} className="form-control-glass"/>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Control as="textarea" name="coverLetter" style={{ height: '120px' }} onChange={handleChange} placeholder="Cover Letter (Optional)" className="form-control-glass"/>
                        </Form.Group>
                        <Button disabled={loading} className="w-100 btn-glow" type="submit" size="lg">
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </Form>
                    <div className="auth-footer">
                        Already a Member? <Link to="/login">Log In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyInternship;