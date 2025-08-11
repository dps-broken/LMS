import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        batch: '',
        mobileNumber: ''
    });
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // *** THIS IS THE CRUCIAL CHANGE ***
                // Call the new public endpoints instead of the admin ones.
                const [deptRes, batchRes] = await Promise.all([
                    axiosInstance.get('/api/departments'),
                    axiosInstance.get('/api/batches'),
                ]);
                setDepartments(deptRes.data);
                setBatches(batchRes.data);
            } catch (err) {
                toast.error('Could not load departments or batches for signup.');
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (formData.password.length < 8) {
            return setError('Password must be at least 8 characters long.');
        }

        setLoading(true);
        setError('');
        try {
            const { data } = await axiosInstance.post('/api/signup', formData);
            toast.success(data.message);
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed.');
            toast.error(err.response?.data?.message || 'Signup failed.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Student Signup</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            {/* Form fields for fullName, email, password, confirmPassword, department, batch, mobileNumber */}
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control type="text" name="fullName" required onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name="email" required onChange={handleChange} />
                            </Form.Group>
                             <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name="password" required onChange={handleChange} />
                                <Form.Text muted>Min. 8 characters with a number & a special character.</Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control type="password" name="confirmPassword" required onChange={handleChange} />
                            </Form.Group>
                             <Form.Group className="mb-3">
                                <Form.Label>Department</Form.Label>
                                <Form.Select name="department" required onChange={handleChange}>
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                             <Form.Group className="mb-3">
                                <Form.Label>Batch</Form.Label>
                                <Form.Select name="batch" required onChange={handleChange}>
                                    <option value="">Select Batch</option>
                                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile Number (Optional)</Form.Label>
                                <Form.Control type="tel" name="mobileNumber" onChange={handleChange} />
                            </Form.Group>
                            <Button disabled={loading} className="w-100" type="submit">
                                {loading ? 'Signing Up...' : 'Sign Up'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
                <div className="w-100 text-center mt-2">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
};
export default Signup;