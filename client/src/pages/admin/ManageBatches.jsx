import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import { Button, Table, Modal as BootstrapModal } from 'react-bootstrap';
import Modal from '../../components/common/Modal.jsx'; // Our custom Modal
import BatchForm from '../../components/admin/BatchForm.jsx';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [deletingBatch, setDeletingBatch] = useState(null);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            // --- THIS IS THE FIX ---
            // The API call now uses the correct, full endpoint: /api/admin/batches
            const { data } = await axiosInstance.get('/api/admin/batches');
            // --------------------
            setBatches(data);
        } catch (error) {
            toast.error("Failed to fetch batches.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const openAddModal = () => {
        setEditingBatch(null);
        setShowFormModal(true);
    };

    const openEditModal = (batch) => {
        setEditingBatch(batch);
        setShowFormModal(true);
    };

    const handleFormSubmit = () => {
        setShowFormModal(false);
        fetchBatches(); // Refresh the list after creating/updating a batch
    };

    const handleDelete = async () => {
        if (!deletingBatch) return;
        try {
            await axiosInstance.delete(`/api/admin/batches/${deletingBatch._id}`);
            toast.success("Batch deleted successfully.");
            setDeletingBatch(null);
            fetchBatches(); // Refresh the list after deleting a batch
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete batch.');
            setDeletingBatch(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Manage Batches</h1>
                <Button variant="primary" onClick={openAddModal}><FiPlus /> Add Batch</Button>
            </div>
            
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Batch Name</th>
                        <th>Course</th>
                        <th>Instructor</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.map((batch) => (
                        <tr key={batch._id}>
                            <td>{batch.name}</td>
                            <td>{batch.department?.name || 'N/A'}</td>
                            <td>{batch.instructorName} ({batch.instructorPosition})</td>
                            <td>{format(new Date(batch.startTime), 'PPP')}</td>
                            <td>{format(new Date(batch.endTime), 'PPP')}</td>
                            <td>
                                <Button variant="outline-primary" size="sm" onClick={() => openEditModal(batch)} className="me-2" title="Edit Batch">
                                    <FiEdit />
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => setDeletingBatch(batch)} title="Delete Batch">
                                    <FiTrash2 />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            <Modal 
                show={showFormModal} 
                handleClose={() => setShowFormModal(false)} 
                title={editingBatch ? "Edit Batch" : "Add New Batch"} 
                size="lg"
            >
                <BatchForm batch={editingBatch} onFormSubmit={handleFormSubmit} />
            </Modal>

            <Modal 
                show={!!deletingBatch} 
                handleClose={() => setDeletingBatch(null)} 
                title="Confirm Deletion" 
                onConfirm={handleDelete} 
                confirmText="Delete"
            >
                <p>Are you sure you want to delete the batch "<strong>{deletingBatch?.name}</strong>"? This may affect assigned students and schedules.</p>
            </Modal>
        </div>
    );
};

export default ManageBatches;