import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const NotificationForm = () => {
    const [target, setTarget] = useState('all');
    const [department, setDepartment] = useState('');
    const [batch, setBatch] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, batchRes] = await Promise.all([
                    axiosInstance.get('/api/admin/departments'),
                    axiosInstance.get('/api/admin/batches')
                ]);
                setDepartments(deptRes.data);
                setBatches(batchRes.data);
            } catch (err) {
                toast.error("Could not fetch departments or batches.");
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { target, subject, message, department, batch };
            const { data } = await axiosInstance.post('/api/admin/notifications', payload);
            toast.success(data.message);
            // Reset form
            setTarget('all');
            setDepartment('');
            setBatch('');
            setSubject('');
            setMessage('');
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send notification.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Target Audience</Form.Label>
                        <Form.Select value={target} onChange={(e) => setTarget(e.target.value)}>
                            <option value="all">All Students</option>
                            <option value="department">Specific Department</option>
                            <option value="batch">Specific Batch</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                {target === 'department' && (
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Department</Form.Label>
                            <Form.Select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                <option value="">-- Select --</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                )}
                {target === 'batch' && (
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Batch</Form.Label>
                            <Form.Select value={batch} onChange={(e) => setBatch(e.target.value)} required>
                                <option value="">-- Select --</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                )}
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Subject</Form.Label>
                        <Form.Control type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Message</Form.Label>
                        <Form.Control as="textarea" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                    </Form.Group>
                </Col>
            </Row>
            <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Broadcast Notification'}
            </Button>
        </Form>
    );
};

export default NotificationForm;