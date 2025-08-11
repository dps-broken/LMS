import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { Table, Badge, Button, Form } from 'react-bootstrap';
import { format } from 'date-fns';
import Modal from '../../components/common/Modal';

const ManageInternshipApps = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/internships/applications');
            setApplications(data);
        } catch (err) {
            toast.error("Failed to fetch internship applications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const openDetailsModal = (app) => {
        setSelectedApp(app);
        setShowDetailsModal(true);
    };

    const openStatusModal = (app) => {
        setSelectedApp(app);
        setNewStatus(app.status);
        setShowStatusModal(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedApp || !newStatus) return;
        try {
            await axiosInstance.put(`/api/internships/applications/${selectedApp._id}/status`, { status: newStatus });
            toast.success("Application status updated.");
            setShowStatusModal(false);
            fetchApplications();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status.');
        }
    };
    
    const getStatusBadge = (status) => {
        const variants = { 'applied': 'info', 'under review': 'primary', 'shortlisted': 'warning', 'offered': 'success', 'rejected': 'danger' };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h1>Internship Applications</h1>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th>Batch</th>
                        <th>Application Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map(app => (
                        <tr key={app._id}>
                            <td>{app.student.fullName}</td>
                            <td>{app.student.department.name}</td>
                            <td>{app.student.batch.name}</td>
                            <td>{format(new Date(app.createdAt), 'PPP')}</td>
                            <td className="text-capitalize">{getStatusBadge(app.status)}</td>
                            <td>
                                <Button variant="info" size="sm" onClick={() => openDetailsModal(app)} className="me-2">Details</Button>
                                <Button variant="secondary" size="sm" onClick={() => openStatusModal(app)}>Update Status</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Details Modal */}
            <Modal show={showDetailsModal} handleClose={() => setShowDetailsModal(false)} title="Application Details">
                {selectedApp && (
                    <div>
                        <h5>{selectedApp.student.fullName}</h5>
                        <p><strong>Email:</strong> {selectedApp.student.email}</p>
                        <p><strong>Cover Letter:</strong></p>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApp.coverLetter || 'N/A'}</p>
                        <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">View Resume (PDF)</a>
                    </div>
                )}
            </Modal>
            
            {/* Status Update Modal */}
            <Modal show={showStatusModal} handleClose={() => setShowStatusModal(false)} title="Update Application Status" onConfirm={handleStatusUpdate} confirmText="Update">
                 {selectedApp && (
                    <Form.Group>
                        <Form.Label>New Status for {selectedApp.student.fullName}</Form.Label>
                        <Form.Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                            <option value="applied">Applied</option>
                            <option value="under review">Under Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="offered">Offered</option>
                        </Form.Select>
                    </Form.Group>
                 )}
            </Modal>
        </div>
    );
};
export default ManageInternshipApps;