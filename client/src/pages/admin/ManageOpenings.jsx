import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
// --- THIS IS THE FIX ---
// We import 'Form' instead of 'Switch'
import { Button, Table, Modal as BootstrapModal, Form } from 'react-bootstrap';
// --------------------
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Loader from '../../components/common/Loader.jsx';

/**
 * A reusable form component for creating or editing an internship position/opening.
 */
const PositionForm = ({ position, onFormSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (position) {
            setTitle(position.title);
            setDescription(position.description);
            setIsActive(position.isActive);
        } else {
            setTitle(''); 
            setDescription(''); 
            setIsActive(true);
        }
    }, [position]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = position ? `/api/admin/positions/${position._id}` : '/api/admin/positions';
        const method = position ? 'put' : 'post';
        try {
            await axiosInstance[method](endpoint, { title, description, isActive });
            toast.success(`Position ${position ? 'updated' : 'created'} successfully!`);
            onFormSubmit();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Position Title</Form.Label>
                <Form.Control type="text" value={title} onChange={e => setTitle(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
            </Form.Group>
            {/* --- THIS IS THE FIX --- */}
            {/* The component is rendered as <Form.Check type="switch"> */}
            <Form.Group className="mb-3">
                <Form.Check 
                    type="switch" 
                    id="is-active-switch" 
                    label="Is Active (Visible on public form)" 
                    checked={isActive} 
                    onChange={e => setIsActive(e.target.checked)} 
                />
            </Form.Group>
            {/* ----------------------- */}
            <Button type="submit" disabled={loading} className="w-100">
                {loading ? 'Saving...' : 'Save Position'}
            </Button>
        </Form>
    );
};

/**
 * The main admin page for creating and managing internship openings.
 */
const ManageOpenings = () => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPosition, setEditingPosition] = useState(null);

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/admin/positions');
            setPositions(data);
        } catch (error) {
            toast.error("Failed to fetch positions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPositions(); }, []);
    
    const handleDelete = async (posId) => {
        if (window.confirm("Are you sure you want to delete this opening? This action cannot be undone.")) {
            try {
                await axiosInstance.delete(`/api/admin/positions/${posId}`);
                toast.success("Position deleted.");
                fetchPositions();
            } catch (err) {
                toast.error("Deletion failed.");
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Manage Openings</h1>
                <Button variant="primary" onClick={() => { setEditingPosition(null); setShowModal(true); }}>
                    <FiPlus /> New Opening
                </Button>
            </div>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map(pos => (
                        <tr key={pos._id}>
                            <td>{pos.title}</td>
                            <td>
                                {pos.isActive 
                                    ? <span className="text-success fw-bold">Active</span> 
                                    : <span className="text-danger">Inactive</span>
                                }
                            </td>
                            <td>
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setEditingPosition(pos); setShowModal(true); }}>
                                    <FiEdit />
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(pos._id)}>
                                    <FiTrash2 />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <BootstrapModal show={showModal} onHide={() => setShowModal(false)} centered>
                <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>{editingPosition ? 'Edit Opening' : 'Create New Opening'}</BootstrapModal.Title>
                </BootstrapModal.Header>
                <BootstrapModal.Body>
                    <PositionForm 
                        position={editingPosition} 
                        onFormSubmit={() => { setShowModal(false); fetchPositions(); }} 
                    />
                </BootstrapModal.Body>
            </BootstrapModal>
        </div>
    );
};

export default ManageOpenings;