import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const DepartmentForm = ({ department, onFormSubmit }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (department) {
            setName(department.name);
        } else {
            setName('');
        }
    }, [department]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = department ? `/api/admin/departments/${department._id}` : '/api/admin/departments';
        const method = department ? 'put' : 'post';

        try {
            await axiosInstance[method](endpoint, { name });
            toast.success(`Department ${department ? 'updated' : 'created'} successfully!`);
            onFormSubmit();
        } catch (err) {
            const message = err.response?.data?.message || `Failed to ${department ? 'update' : 'create'} department.`;
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
                <Form.Label>Department Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder='e.g., "Web Development" or "Data Science"'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : (department ? 'Update Department' : 'Create Department')}
            </Button>
        </Form>
    );
};

export default DepartmentForm;