import React, {useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Button, Table, Form, Row, Col, Alert } from 'react-bootstrap';
import { FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';

/**
 * A reusable form component placed within the ManageAssessments page for creating new assessments.
 * @param {object} props
 * @param {function} props.onFormSubmit - Callback to close the modal and refresh data on success.
 */
const AssessmentForm = ({ onFormSubmit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [batch, setBatch] = useState('');
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const { data } = await axiosInstance.get('/api/admin/batches');
                setBatches(data);
            } catch (error) {
                toast.error("Could not load batches for the dropdown menu.");
            }
        };
        fetchBatches();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/api/admin/assessments', { name, description, deadline, batch });
            toast.success("Assessment created successfully!");
            onFormSubmit();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create assessment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3"><Form.Label>Assessment Name</Form.Label><Form.Control type="text" value={name} onChange={e => setName(e.target.value)} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Description / Details</Form.Label><Form.Control as="textarea" rows={4} value={description} onChange={e => setDescription(e.target.value)} required /></Form.Group>
            <Row>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Submission Deadline</Form.Label><Form.Control type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Target Batch</Form.Label><Form.Select value={batch} onChange={e => setBatch(e.target.value)} required><option value="">-- Select Batch --</option>{batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</Form.Select></Form.Group></Col>
            </Row>
            <Button type="submit" disabled={loading} className="w-100">{loading ? "Creating..." : "Create Assessment"}</Button>
        </Form>
    );
};

/**
 * The main admin page for creating assessments and viewing/managing submissions.
 */
const ManageAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/admin/assessments');
            setAssessments(data);
        } catch (error) {
            toast.error("Failed to fetch assessments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssessments(); }, []);

    const handleViewSubmissions = async (assessment) => {
        setSelectedAssessment(assessment);
        setShowSubmissionsModal(true);
        setIsSubmissionsLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/admin/assessments/${assessment._id}/submissions`);
            setSubmissions(data);
        } catch (err) {
            toast.error("Failed to fetch submissions.");
        } finally {
            setIsSubmissionsLoading(false);
        }
    };

    /**
     * Handles the permanent deletion of an assessment after a strong confirmation.
     * @param {string} assessmentId - The ID of the assessment to delete.
     * @param {string} assessmentName - The name of the assessment for the confirmation dialog.
     */
    const handleDeleteAssessment = async (assessmentId, assessmentName) => {
        const confirmMessage = `Are you sure you want to PERMANENTLY delete the assessment "${assessmentName}"?\n\nAll student submissions for this assessment will also be erased. This cannot be undone.`;
        if (window.confirm(confirmMessage)) {
            try {
                await axiosInstance.delete(`/api/admin/assessments/${assessmentId}`);
                toast.success("Assessment deleted successfully.");
                fetchAssessments(); // Refresh the list to remove the deleted item
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to delete assessment.");
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Manage Assessments</h1>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}><FiPlus /> Create Assessment</Button>
            </div>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Batch</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assessments.map(ass => (
                        <tr key={ass._id}>
                            <td>{ass.name}</td>
                            <td>{ass.batch?.name || 'N/A'}</td>
                            <td>{format(new Date(ass.deadline), 'Pp')}</td>
                            <td>
                                <Button 
                                    variant="outline-info" 
                                    size="sm" 
                                    onClick={() => handleViewSubmissions(ass)} 
                                    className="me-2" 
                                    title="View Submissions"
                                >
                                    <FiEye />
                                </Button>
                                <Button 
                                    variant="outline-danger" 
                                    size="sm" 
                                    onClick={() => handleDeleteAssessment(ass._id, ass.name)} 
                                    title="Delete Assessment"
                                >
                                    <FiTrash2 />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal 
                show={showCreateModal} 
                handleClose={() => setShowCreateModal(false)} 
                title="Create New Assessment"
            >
                <AssessmentForm onFormSubmit={() => { setShowCreateModal(false); fetchAssessments(); }} />
            </Modal>

            <Modal 
                show={showSubmissionsModal} 
                handleClose={() => setShowSubmissionsModal(false)} 
                title={`Submissions for: ${selectedAssessment?.name}`} 
                size="xl"
            >
                {isSubmissionsLoading ? <Loader /> : (
                    <Table hover responsive size="sm">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>GitHub Link</th>
                                <th>Description</th>
                                <th>Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length > 0 ? submissions.map(sub => (
                                <tr key={sub._id}>
                                    <td>{sub.student?.fullName || 'N/A'}</td>
                                    <td><a href={sub.githubLink} target="_blank" rel="noopener noreferrer">View Repository</a></td>
                                    <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{sub.description}</td>
                                    <td>{format(new Date(sub.submittedAt), 'Pp')}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-3">
                                        <Alert variant="info" className="mb-0">No submissions have been made for this assessment yet.</Alert>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </Modal>
        </div>
    );
};
export default ManageAssessments;