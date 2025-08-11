import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import { Button, Table, Modal as BootstrapModal } from 'react-bootstrap';
import Modal from '../../components/common/Modal.jsx';
import ScheduleClassForm from '../../components/admin/ScheduleClassForm.jsx';
import { format } from 'date-fns';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const ManageSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [deletingSchedule, setDeletingSchedule] = useState(null);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/admin/schedule');
            setSchedules(data);
        } catch (error) {
            toast.error("Failed to fetch schedules.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const openAddModal = () => {
        setEditingSchedule(null);
        setShowModal(true);
    };

    const openEditModal = (schedule) => {
        setEditingSchedule(schedule);
        setShowModal(true);
    };

    const handleFormSubmit = () => {
        setShowModal(false);
        fetchSchedules();
    };
    
    const handleDelete = async () => {
        if (!deletingSchedule) return;
        try {
            await axiosInstance.delete(`/api/admin/schedule/${deletingSchedule._id}`);
            toast.success("Scheduled class removed successfully.");
            setDeletingSchedule(null);
            fetchSchedules();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete schedule.');
            setDeletingSchedule(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Manage Class Schedules</h1>
                <Button variant="primary" onClick={openAddModal}><FiPlus /> Schedule a Class</Button>
            </div>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Topic</th>
                        <th>Department</th>
                        <th>Batch</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Instructor</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map(schedule => (
                        <tr key={schedule._id}>
                            <td>{schedule.topic}</td>
                            {/* --- THIS IS THE FIX --- */}
                            {/* Use optional chaining (?.) to prevent a crash if department or batch is null */}
                            <td>{schedule.department?.name || 'N/A'}</td>
                            <td>{schedule.batch?.name || 'N/A'}</td>
                            {/* ----------------------- */}
                            <td>{format(new Date(schedule.startTime), 'PPP')}</td>
                            <td>{`${format(new Date(schedule.startTime), 'p')} - ${format(new Date(schedule.endTime), 'p')}`}</td>
                            <td>{schedule.instructor}</td>
                            <td>
                                <Button variant="outline-primary" size="sm" onClick={() => openEditModal(schedule)} className="me-2" title="Edit Schedule">
                                    <FiEdit />
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => setDeletingSchedule(schedule)} title="Delete Schedule">
                                    <FiTrash2 />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                title={editingSchedule ? "Edit Class" : "Schedule New Class"} 
                size="lg"
            >
                <ScheduleClassForm schedule={editingSchedule} onFormSubmit={handleFormSubmit} />
            </Modal>

            <Modal 
                show={!!deletingSchedule} 
                handleClose={() => setDeletingSchedule(null)} 
                title="Confirm Deletion" 
                onConfirm={handleDelete} 
                confirmText="Delete"
            >
                <p>Are you sure you want to delete the class "<strong>{deletingSchedule?.topic}</strong>"? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default ManageSchedule;