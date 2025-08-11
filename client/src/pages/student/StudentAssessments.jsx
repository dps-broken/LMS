import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Button, Card, Form, Badge, Accordion, FloatingLabel, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';

/**
 * A reusable form component for making a submission, nested for simplicity.
 * @param {object} props
 * @param {string} props.assessmentId - The ID of the assessment being submitted.
 * @param {function} props.onFormSubmit - Callback to close the modal and refresh data.
 */
const SubmissionForm = ({ assessmentId, onFormSubmit }) => {
    const [githubLink, setGithubLink] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post(`/api/student/assessments/${assessmentId}/submit`, { githubLink, description });
            toast.success("Assessment submitted successfully!");
            onFormSubmit();
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <FloatingLabel controlId="githubLink" label="GitHub Repository Link" className="mb-3">
                <Form.Control type="url" placeholder="https://github.com/user/repo" value={githubLink} onChange={e => setGithubLink(e.target.value)} required />
            </FloatingLabel>
            <FloatingLabel controlId="description" label="Submission Description" className="mb-3">
                <Form.Control as="textarea" placeholder="Describe your submission..." value={description} onChange={e => setDescription(e.target.value)} required style={{ height: '120px' }} />
            </FloatingLabel>
            <Button type="submit" disabled={loading} className="w-100">{loading ? "Submitting..." : "Submit Assessment"}</Button>
        </Form>
    );
};

/**
 * The main student-facing page for viewing and submitting assessments.
 */
const StudentAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/student/assessments');
            setAssessments(data);
        } catch (error) {
            toast.error("Failed to fetch assessments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssessments(); }, []);

    const handleOpenModal = (assessment) => {
        setSelectedAssessment(assessment);
        setShowModal(true);
    };

    const handleFormSubmit = () => {
        setShowModal(false);
        fetchAssessments(); // Refresh the list to update the status to "Submitted"
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h1>My Assessments</h1>
            <p className="text-muted">Here are the active assessments for your batch. Please submit them before the deadline.</p>

            {assessments.length > 0 ? assessments.map(ass => (
                <Card key={ass._id} className="mb-3 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-light">{ass.name}</h5>
                        {ass.isSubmitted 
                            ? <Badge bg="success">Submitted</Badge> 
                            : <Badge bg="warning">Pending</Badge>
                        }
                    </Card.Header>
                    <Card.Body>
                        <Card.Text><strong>Submission Deadline:</strong> <span className="text-danger">{format(new Date(ass.deadline), 'PPP p')}</span></Card.Text>
                        <Accordion>
                            <Accordion.Item eventKey={ass._id}>
                                <Accordion.Header>View Description / Details</Accordion.Header>
                                <Accordion.Body style={{ whiteSpace: 'pre-wrap' }}>
                                    {ass.description}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Card.Body>
                    {!ass.isSubmitted && (
                        <Card.Footer className="text-end">
                            <Button variant="primary" onClick={() => handleOpenModal(ass)}>Submit Assessment</Button>
                        </Card.Footer>
                    )}
                </Card>
            )) : <Alert variant="info">You have no active assessments at the moment.</Alert>}

            <Modal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                title={`Submit: ${selectedAssessment?.name}`}
            >
                <SubmissionForm 
                    assessmentId={selectedAssessment?._id} 
                    onFormSubmit={handleFormSubmit} 
                />
            </Modal>
        </div>
    );
};

export default StudentAssessments;