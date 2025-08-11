import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const StudentForm = ({ student, onFormSubmit }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        department: '',
        batch: '',
        status: 'active',
    });
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        if (student) {
            setFormData({
                fullName: student.fullName,
                email: student.email,
                department: student.department._id,
                batch: student.batch._id,
                status: student.status,
            });
        } else {
            setFormData({ fullName: '', email: '', department: '', batch: '', status: 'active' });
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = student ? `/api/admin/students/${student._id}` : '/api/admin/students';
        const method = student ? 'put' : 'post';

        try {
            await axiosInstance[method](endpoint, formData);
            toast.success(`Student ${student ? 'updated' : 'added'} successfully!`);
            onFormSubmit();
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to save student data.';
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
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!student} />
                        {student && <Form.Text muted className='text-secondary-custom'>Email cannot be changed after creation.</Form.Text>}
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Select name="department" value={formData.department} onChange={handleChange} required>
                            <option value="">-- Select --</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Batch</Form.Label>
                        <Form.Select name="batch" value={formData.batch} onChange={handleChange} required>
                            <option value="">-- Select --</option>
                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                 {student && (
                     <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                 )}
            </Row>
            <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
            </Button>
        </Form>
    );
};

export default StudentForm;