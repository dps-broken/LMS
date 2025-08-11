import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import { Table, Badge, Button, ButtonGroup, Form, Row, Col, Modal as BootstrapModal } from 'react-bootstrap';
import { format } from 'date-fns';
import { FiCheckCircle, FiXCircle, FiDownload } from 'react-icons/fi';

const ManagePublicApps = () => {
    const [allApplications, setAllApplications] = useState([]); // Holds all data from API
    const [filteredApplications, setFilteredApplications] = useState([]); // Holds data to be displayed
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [assignment, setAssignment] = useState({ department: '', batch: '' });
    const [isApproving, setIsApproving] = useState(false);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/admin/public-applications');
            setAllApplications(data); // Store the full, unfiltered list
        } catch (err) {
            toast.error("Failed to fetch applications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchApplications();
            try {
                const deptRes = await axiosInstance.get('/api/admin/departments');
                const batchRes = await axiosInstance.get('/api/admin/batches');
                setDepartments(deptRes.data);
                setBatches(batchRes.data);
            } catch (error) {
                toast.error("Could not load data for assignment dropdowns.");
            }
        };
        fetchData();
    }, []);

    // This effect runs whenever the main list or the filter changes.
    useEffect(() => {
        const filtered = allApplications.filter(app => {
            if (statusFilter === '') return true; // Show all
            return app.status === statusFilter;
        });
        setFilteredApplications(filtered);
    }, [allApplications, statusFilter]);

    const openApproveModal = (app) => {
        setSelectedApp(app);
        setAssignment({ department: '', batch: '' });
        setShowApproveModal(true);
    };

    const handleApprove = async () => {
        if (!assignment.department || !assignment.batch) {
            return toast.error("Please select both a department and a batch.");
        }
        setIsApproving(true);
        try {
            const { data } = await axiosInstance.put(`/api/admin/public-applications/${selectedApp._id}/approve`, assignment);
            toast.success(data.message);
            setShowApproveModal(false);
            await fetchApplications(); // Refresh the master list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Approval failed.');
        } finally {
            setIsApproving(false);
        }
    };
    
    const handleReject = async (appId) => {
        if (!window.confirm("Are you sure you want to reject this application?")) return;
        try {
            await axiosInstance.put(`/api/admin/public-applications/${appId}/status`, { status: 'rejected' });
            toast.success("Application marked as rejected.");
            await fetchApplications();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed.');
        }
    };
    
    if (loading) return <Loader />;

    return (
        <div>
            <h1>Public Internship Applications</h1>
            <Form.Group as={Row} className="mb-3 align-items-center">
                <Form.Label column sm="auto" className="fw-bold text-secondary my-2">Filter by Status:</Form.Label>
                <Col sm={4}>
                    <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="approved">Approved</option>
                        <option value="">Show All</option>
                    </Form.Select>
                </Col>
            </Form.Group>

            <Table striped bordered hover responsive>
                <thead>
                    <tr><th>Applicant Name & Resume</th><th>Email</th><th>Position Applied For</th><th>Applied On</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {filteredApplications.map(app => (
                        <tr key={app._id}>
                            <td>{app.fullName} <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="ms-2" title="View Resume"><FiDownload /></a></td>
                            <td>{app.email}</td>
                            <td>{app.positionTitle}</td>
                            <td>{format(new Date(app.createdAt), 'PPP')}</td>
                            <td><Badge bg={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>{app.status}</Badge></td>
                            <td>
                                {(app.status === 'pending' || app.status === 'shortlisted') && (
                                    <ButtonGroup size="sm">
                                        <Button variant="success" onClick={() => openApproveModal(app)}><FiCheckCircle /> Approve</Button>
                                        <Button variant="danger" onClick={() => handleReject(app._id)}><FiXCircle /> Reject</Button>
                                    </ButtonGroup>
                                )}
                                {app.status === 'approved' && (<Badge bg="success">Approved</Badge>)}
                                {app.status === 'rejected' && (<Badge bg="danger">Rejected</Badge>)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <BootstrapModal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered>
                <BootstrapModal.Header closeButton><BootstrapModal.Title>Approve & Assign: {selectedApp?.fullName}</BootstrapModal.Title></BootstrapModal.Header>
                <BootstrapModal.Body>
                    <p>Select the department and batch to assign this student to. An account will be created and credentials will be emailed.</p>
                    <Form.Group className="mb-3">
                        <Form.Label>Department (Course)</Form.Label>
                        <Form.Select value={assignment.department} onChange={e => setAssignment({...assignment, department: e.target.value, batch: ''})} required>
                            <option value="">-- Select Department --</option>
                            {departments.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Batch</Form.Label>
                        <Form.Select value={assignment.batch} onChange={e => setAssignment({...assignment, batch: e.target.value})} required>
                            <option value="">-- Select Batch --</option>
                            {batches.filter(b => b.department._id === assignment.department).map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </BootstrapModal.Body>
                <BootstrapModal.Footer>
                    <Button variant="secondary" onClick={() => setShowApproveModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleApprove} disabled={isApproving}>{isApproving ? 'Approving...' : 'Confirm Approval'}</Button>
                </BootstrapModal.Footer>
            </BootstrapModal>
        </div>
    );
};
export default ManagePublicApps;