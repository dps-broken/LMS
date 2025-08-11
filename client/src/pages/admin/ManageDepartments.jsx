import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { Button, Table, Badge } from 'react-bootstrap';
import Modal from '../../components/common/Modal';
import DepartmentForm from '../../components/admin/DepartmentForm';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [deletingDept, setDeletingDept] = useState(null);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/admin/departments');
            setDepartments(data);
        } catch (error) {
            toast.error("Failed to fetch departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const openAddModal = () => {
        setEditingDept(null);
        setShowModal(true);
    };

    const openEditModal = (dept) => {
        setEditingDept(dept);
        setShowModal(true);
    };
    
    const handleFormSubmit = () => {
        setShowModal(false);
        fetchDepartments();
    };

    const handleDelete = async () => {
        if (!deletingDept) return;
        try {
            await axiosInstance.delete(`/api/admin/departments/${deletingDept._id}`);
            toast.success("Department deleted successfully.");
            setDeletingDept(null);
            fetchDepartments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete department.');
            setDeletingDept(null);
        }
    };
    
    if (loading) return <Loader />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Manage Departments</h1>
                <Button variant="primary" onClick={openAddModal}><FiPlus /> Add Department</Button>
            </div>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Department Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept, index) => (
                        <tr key={dept._id}>
                            <td>{index + 1}</td>
                            <td>{dept.name}</td>
                            <td>
                                <Button variant="outline-primary" size="sm" onClick={() => openEditModal(dept)} className="me-2">
                                    <FiEdit />
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => setDeletingDept(dept)}>
                                    <FiTrash2 />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} handleClose={() => setShowModal(false)} title={editingDept ? "Edit Department" : "Add New Department"}>
                <DepartmentForm department={editingDept} onFormSubmit={handleFormSubmit} />
            </Modal>
            
            <Modal show={!!deletingDept} handleClose={() => setDeletingDept(null)} title="Confirm Deletion" onConfirm={handleDelete} confirmText="Delete">
                <p>Are you sure you want to delete the department "<strong>{deletingDept?.name}</strong>"? This action cannot be undone and may fail if students are assigned to it.</p>
            </Modal>
        </div>
    );
};
export default ManageDepartments;