import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { Card, Form, Button, Alert, Badge } from 'react-bootstrap';

const StudentInternship = () => {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form state
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get('/api/student/internship/status');
                setApplication(data);
            } catch (err) {
                // It's okay if it's a 404, means no application yet
                if (err.response?.status !== 404) {
                    toast.error("Could not check application status.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!resumeFile) {
            return setError("A resume (PDF) is required.");
        }
        setLoading(true);
        setError('');
        
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('coverLetter', coverLetter);
        formData.append('portfolioLinks[github]', github);
        formData.append('portfolioLinks[linkedin]', linkedin);

        try {
            const { data } = await axiosInstance.post('/api/internship/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("Application submitted successfully!");
            setApplication(data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Application submission failed.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    if (application) {
        return (
            <div>
                <h1>Internship Application Status</h1>
                <Card>
                    <Card.Body>
                        <Card.Title>Your application has been submitted.</Card.Title>
                        <p><strong>Status:</strong> <Badge bg="primary" className="text-capitalize">{application.status}</Badge></p>
                        <p>We will notify you of any updates. You can also check back here for the current status of your application.</p>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <h1>Apply for Internship</h1>
            <p>Fill out the form below to submit your application for internship opportunities.</p>
            <Card>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Resume/CV (PDF only)</Form.Label>
                            <Form.Control type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cover Letter</Form.Label>
                            <Form.Control as="textarea" rows={8} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Write a brief introduction about yourself and your skills..." />
                        </Form.Group>
                         <Form.Group className="mb-3">
                            <Form.Label>Portfolio Links (Optional)</Form.Label>
                            <Form.Control className="mb-2" type="url" placeholder="GitHub Profile URL" value={github} onChange={(e) => setGithub(e.target.value)} />
                            <Form.Control type="url" placeholder="LinkedIn Profile URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                        </Form.Group>
                        <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Application"}</Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};
export default StudentInternship;