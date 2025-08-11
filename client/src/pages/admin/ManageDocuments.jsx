import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Button, Table, Form, Row, Col, Accordion, FloatingLabel } from 'react-bootstrap';
import Modal from '../../components/common/Modal.jsx';
import Loader from '../../components/common/Loader.jsx';
import { format } from 'date-fns';

/**
 * Defines the initial, empty state for the document generation form.
 * This function is used to reset the form after a new document is created or the modal is opened.
 */
const getInitialFormState = () => ({
    studentId: '',
    type: 'certificate',
    title: '',
    // Optional fields for the certificate template
    pronounHeShe: 'They',
    pronounHisHer: 'Their',
    projectDetails: '',
    projectGoal: '',
    internContribution: '',
    internImpact: '',
    internshipEndDate: '',
    // Optional fields for the offer letter template
    studentAddress: '',
    internshipDuration: '',
    stipend: '',
    workingHours: '',
    supervisorName: '',
    supervisorTitle: '',
    acceptanceDeadline: '',
});

/**
 * Admin page for generating and viewing all student documents (Certificates, Offer Letters).
 * Includes a modal with a detailed form for document customization.
 */
const ManageDocuments = () => {
    // State for the list of documents displayed in the main table
    const [documents, setDocuments] = useState([]);
    // State for the list of students used to populate the form's dropdown
    const [students, setStudents] = useState([]);
    // State to control the visibility of the "Generate" modal
    const [showModal, setShowModal] = useState(false);
    // State for the main page's initial loading indicator
    const [loading, setLoading] = useState(true);
    // State for the submission button's loading indicator inside the modal
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State that holds all the data for the document generation form
    const [formData, setFormData] = useState(getInitialFormState());

    /**
     * Reusable function to fetch the list of generated documents from the server
     * and update the component's state, causing the UI to re-render.
     */
    const fetchDocuments = async () => {
        try {
            const { data } = await axiosInstance.get('/api/admin/documents');
            setDocuments(data);
        } catch (err) {
            toast.error("Could not refresh the document list.");
        }
    };

    // This effect runs once when the component first mounts.
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch the list of students and the initial document list at the same time.
                await Promise.all([
                    (async () => {
                        const res = await axiosInstance.get('/api/admin/students?limit=1000&status=active');
                        setStudents(res.data.students);
                    })(),
                    fetchDocuments() // Call our reusable function to get the initial list
                ]);
            } catch (err) {
                toast.error("Failed to fetch initial page data.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []); // The empty dependency array ensures this runs only once.
    
    /**
     * Handles the submission of the document generation form.
     */
    const handleGenerate = async () => {
        if (!formData.studentId || !formData.title.trim()) {
            return toast.error("Please select a student and provide a document title.");
        }
        setIsSubmitting(true);
        try {
            // Send all form data to the backend to generate the document
            await axiosInstance.post('/api/admin/documents/generate', formData);
            toast.success('Document generated and sent successfully!');
            
            setShowModal(false);

            // --- THIS IS THE FIX ---
            // After a successful generation, call the fetchDocuments function again.
            // This will get the updated list from the server and refresh the table in the UI.
            await fetchDocuments();
            // ---------------------

        } catch(err) {
            toast.error(err.response?.data?.message || 'Failed to generate document.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generic handler to update the form's state as the admin interacts with inputs.
    const handleChange = e => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    // Resets the form to its default state and opens the modal.
    const openModal = () => {
        setFormData(getInitialFormState());
        setShowModal(true);
    }

    // Display a loader for the initial page load.
    if (loading) return <Loader />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Document Management</h1>
                <Button onClick={openModal}>Generate New Document</Button>
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Document Type</th>
                        <th>Title</th>
                        <th>Issue Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map(doc => (
                        <tr key={doc._id}>
                            <td>{doc.student?.fullName || 'N/A'}</td>
                            <td className="text-capitalize">{doc.type.replace('_', ' ')}</td>
                            <td>{doc.title}</td>
                            <td>{format(new Date(doc.issueDate), 'PPP')}</td>
                            <td>
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                                    View PDF
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                title="Generate Document" 
                onConfirm={handleGenerate} 
                confirmText={isSubmitting ? "Generating..." : "Generate & Send"}
                size="lg"
            >
                <Form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
                    <Row>
                        <Col md={7}>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Student</Form.Label>
                                <Form.Select name="studentId" value={formData.studentId} onChange={handleChange} required>
                                    <option value="">-- Select a Student --</option>
                                    {students.map(s => <option key={s._id} value={s._id}>{s.fullName} ({s.email})</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Document Type</Form.Label>
                                <Form.Select name="type" value={formData.type} onChange={handleChange} required>
                                    <option value="certificate">Certificate</option>
                                    <option value="offer_letter">Offer Letter</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-4">
                        <Form.Label>Document Title / Position Name</Form.Label>
                        <Form.Control name="title" placeholder="e.g., Web Development or Frontend Intern" value={formData.title} onChange={handleChange} required />
                    </Form.Group>

                    {formData.type === 'certificate' && (
                        <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Certificate Customization (Optional)</Accordion.Header>
                                <Accordion.Body>
                                    <p className="text-muted small">Fill these fields to override the default text in the certificate. If left blank, generic text will be used.</p>
                                    <Row>
                                        <Col md={6}><FloatingLabel controlId="pronounHeShe" label="Pronoun (He/She/They)" className="mb-3"><Form.Control name="pronounHeShe" value={formData.pronounHeShe} onChange={handleChange} /></FloatingLabel></Col>
                                        <Col md={6}><FloatingLabel controlId="pronounHisHer" label="Pronoun (His/Her/Their)" className="mb-3"><Form.Control name="pronounHisHer" value={formData.pronounHisHer} onChange={handleChange} /></FloatingLabel></Col>
                                    </Row>
                                    <FloatingLabel controlId="internshipEndDate" label="Internship End Date" className="mb-3"><Form.Control type="date" name="internshipEndDate" value={formData.internshipEndDate} onChange={handleChange} /></FloatingLabel>
                                    <FloatingLabel controlId="projectDetails" label="Project Details" className="mb-3"><Form.Control as="textarea" name="projectDetails" placeholder="e.g., the company's main e-commerce platform" value={formData.projectDetails} onChange={handleChange} style={{ height: '100px' }} /></FloatingLabel>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    )}
                    {formData.type === 'offer_letter' && (
                         <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Offer Letter Customization (Optional)</Accordion.Header>
                                <Accordion.Body>
                                    <p className="text-muted small">Fill these fields to override the default text in the offer letter.</p>
                                    <FloatingLabel controlId="studentAddress" label="Student Address" className="mb-3"><Form.Control name="studentAddress" placeholder="123 Main St, Anytown, USA" value={formData.studentAddress} onChange={handleChange} /></FloatingLabel>
                                    <Row>
                                        <Col md={6}><FloatingLabel controlId="internshipDuration" label="Internship Duration" className="mb-3"><Form.Control name="internshipDuration" placeholder="e.g., 3 Months" value={formData.internshipDuration} onChange={handleChange} /></FloatingLabel></Col>
                                        <Col md={6}><FloatingLabel controlId="stipend" label="Stipend / Compensation" className="mb-3"><Form.Control name="stipend" placeholder="e.g., $2000/month" value={formData.stipend} onChange={handleChange} /></FloatingLabel></Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}><FloatingLabel controlId="supervisorName" label="Supervisor's Name" className="mb-3"><Form.Control name="supervisorName" value={formData.supervisorName} onChange={handleChange} /></FloatingLabel></Col>
                                        <Col md={6}><FloatingLabel controlId="supervisorTitle" label="Supervisor's Title" className="mb-3"><Form.Control name="supervisorTitle" value={formData.supervisorTitle} onChange={handleChange} /></FloatingLabel></Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default ManageDocuments;