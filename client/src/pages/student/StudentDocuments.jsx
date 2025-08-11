import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import { Table, Button, Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth.jsx';

/**
 * Page for students to view their personal documents like certificates and offer letters.
 */
const StudentDocuments = () => {
    // State to hold the list of documents fetched from the API
    const [documents, setDocuments] = useState([]);
    // State to manage the loading indicator
    const [loading, setLoading] = useState(true);
    // useAuth hook to get user info and update it after accepting an offer
    const { userInfo, login } = useAuth();

    // Reusable function to fetch the student's documents
    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/student/documents');
            setDocuments(data);
        } catch (err) {
            toast.error("Failed to fetch your documents.");
        } finally {
            setLoading(false);
        }
    };

    // useEffect hook to call fetchDocuments when the component first mounts
    useEffect(() => {
        fetchDocuments();
    }, []); // Empty dependency array ensures this runs only once on load

    /**
     * Handles the logic when a student clicks the "Accept Internship" button.
     * @param {string} docId - The ID of the offer letter document.
     */
    const handleAcceptOffer = async (docId) => {
        if (!window.confirm("Are you sure you want to accept this internship offer? This action will update your status and cannot be undone.")) {
            return;
        }
        try {
            const { data } = await axiosInstance.put(`/api/student/documents/offer/${docId}/accept`);
            toast.success(data.message);

            // Update the user's internship status in the global AuthContext
            const updatedUserInfo = { ...userInfo, internshipStatus: 'accepted' };
            login(updatedUserInfo); // This updates the state and localStorage

            // Refresh the document list to reflect any UI changes (e.g., button state)
            await fetchDocuments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept the offer.');
        }
    };

    // Display a loader while data is being fetched
    if (loading) return <Loader />;

    return (
        <div>
            <h1>My Documents</h1>
            <p className="text-muted">Here you can find all official documents, such as certificates and offer letters, that have been assigned to you by the administration.</p>
            
            <Table striped bordered hover responsive className="mt-4">
                <thead>
                    <tr>
                        <th>Document Title</th>
                        <th>Type</th>
                        <th>Issue Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.length > 0 ? (
                        documents.map(doc => (
                            <tr key={doc._id}>
                                <td>{doc.title}</td>
                                <td className="text-capitalize">{doc.type.replace('_', ' ')}</td>
                                <td>{format(new Date(doc.issueDate), 'PPP')}</td>
                                <td>
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-tertiary btn-sm me-2">
                                        Download PDF
                                    </a>
                                    
                                    {/* Conditionally render the "Accept" button */}
                                    {doc.type === 'offer_letter' && userInfo.internshipStatus !== 'accepted' && (
                                        <Button variant="success" size="sm" onClick={() => handleAcceptOffer(doc._id)}>
                                            Accept Internship
                                        </Button>
                                    )}
                                    {/* Show a badge if the internship has already been accepted */}
                                    {doc.type === 'offer_letter' && userInfo.internshipStatus === 'accepted' && (
                                        <Badge bg="success">Accepted</Badge>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        // Display a message if no documents are found
                        <tr>
                            <td colSpan="4" className="text-center">You have no documents yet.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default StudentDocuments;