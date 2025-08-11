import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const BatchForm = ({ batch, onFormSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        startTime: '',
        endTime: '',
        instructorName: '',
        instructorPosition: '',
    });
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch departments to populate the "Course Name" dropdown
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const { data } = await axiosInstance.get('/api/admin/departments');
                setDepartments(data);
            } catch (err) {
                toast.error("Could not load courses/departments.");
            }
        };
        fetchDepartments();
    }, []);

    // Populate form when in "edit" mode
    useEffect(() => {
        if (batch) {
            setFormData({
                name: batch.name || '',
                department: batch.department?._id || '',
                startTime: batch.startTime ? new Date(batch.startTime).toISOString().split('T')[0] : '',
                endTime: batch.endTime ? new Date(batch.endTime).toISOString().split('T')[0] : '',
                instructorName: batch.instructorName || '',
                instructorPosition: batch.instructorPosition || '',
            });
        } else {
            // Reset form for "create" mode
            setFormData({ name: '', department: '', startTime: '', endTime: '', instructorName: '', instructorPosition: '' });
        }
    }, [batch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const endpoint = batch ? `/api/admin/batches/${batch._id}` : '/api/admin/batches';
        const method = batch ? 'put' : 'post';
        try {
            await axiosInstance[method](endpoint, formData);
            toast.success(`Batch ${batch ? 'updated' : 'created'} successfully!`);
            onFormSubmit();
        } catch (err) {
            const message = err.response?.data?.message || `Failed to ${batch ? 'update' : 'create'} batch.`;
            setError(message);
            toast.error(message);
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
                        <Form.Label>Batch Name</Form.Label>
                        <Form.Control type="text" name="name" placeholder='e.g., "Summer Interns 2025"' value={formData.name} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Course Name</Form.Label>
                        <Form.Select name="department" value={formData.department} onChange={handleChange} required>
                            <option value="">-- Select a Course --</option>
                            {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control type="date" name="startTime" value={formData.startTime} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control type="date" name="endTime" value={formData.endTime} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Instructor Name</Form.Label>
                        <Form.Control type="text" name="instructorName" placeholder="e.g., John Smith" value={formData.instructorName} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Instructor Position</Form.Label>
                        <Form.Control type="text" name="instructorPosition" placeholder="e.g., Lead Developer" value={formData.instructorPosition} onChange={handleChange} required />
                    </Form.Group>
                </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={loading} className="w-100">
                {loading ? 'Saving...' : (batch ? 'Update Batch' : 'Create Batch')}
            </Button>
        </Form>
    );
};

export default BatchForm;