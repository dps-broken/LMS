import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import { Button, Table, Badge, Modal as BootstrapModal, Row, Col, Card, Alert } from 'react-bootstrap';
import QuizForm from '../../components/admin/QuizForm.jsx';
import Modal from '../../components/common/Modal.jsx';
import { format } from 'date-fns';
import { FiPlus, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

const ManageQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [selectedQuizResults, setSelectedQuizResults] = useState(null);
    const [isResultsLoading, setIsResultsLoading] = useState(false);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/admin/quizzes');
            setQuizzes(data);
        } catch (error) {
            toast.error("Failed to fetch quizzes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQuizzes(); }, []);

    const openAddModal = () => { setEditingQuiz(null); setShowFormModal(true); };
    const openEditModal = (quiz) => { setEditingQuiz(quiz); setShowFormModal(true); };
    const handleFormSubmit = () => { setShowFormModal(false); fetchQuizzes(); };

    const openResultsModal = async (quiz) => {
        setSelectedQuiz(quiz);
        setIsResultsLoading(true);
        setShowResultsModal(true);
        try {
            const { data } = await axiosInstance.get(`/api/admin/quizzes/${quiz._id}/submissions`);
            setSelectedQuizResults(data);
        } catch (err) {
            toast.error("Could not fetch quiz submissions.");
            setShowResultsModal(false);
        } finally {
            setIsResultsLoading(false);
        }
    };

    const handleDeleteQuiz = async (quizId, quizTitle) => {
        const confirmMessage = `Are you sure you want to PERMANENTLY delete the quiz "${quizTitle}"?\n\nAll student submissions for this quiz will also be erased forever. This action cannot be undone.`;
        if (window.confirm(confirmMessage)) {
            try {
                await axiosInstance.delete(`/api/admin/quizzes/${quizId}`);
                toast.success("Quiz deleted successfully.");
                fetchQuizzes();
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to delete quiz.");
            }
        }
    };

    const getStatusBadge = (status) => {
        const variants = { active: 'success', upcoming: 'warning', ended: 'secondary' };
        return <Badge bg={variants[status] || 'info'} className="text-capitalize">{status}</Badge>;
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Manage Quizzes</h1>
                <Button variant="primary" onClick={openAddModal}><FiPlus /> Create Quiz</Button>
            </div>
            <Table striped bordered hover responsive>
                <thead><tr><th>Title</th><th>Course</th><th>Batch</th><th>Start Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    {quizzes.map(quiz => (
                        <tr key={quiz._id}>
                            <td>{quiz.title}</td>
                            <td>{quiz.department?.name || 'N/A'}</td>
                            <td>{quiz.batch?.name || 'N/A'}</td>
                            <td>{format(new Date(quiz.startTime), 'Pp')}</td>
                            <td>{getStatusBadge(quiz.status)}</td>
                            <td>
                                <Button variant="outline-primary" size="sm" onClick={() => openEditModal(quiz)} className="me-2" title="Edit Quiz"><FiEdit/></Button>
                                <Button variant="outline-info" size="sm" onClick={() => openResultsModal(quiz)} className="me-2" title="View Results"><FiEye /></Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteQuiz(quiz._id, quiz.title)} title="Delete Quiz"><FiTrash2 /></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal show={showFormModal} handleClose={() => setShowFormModal(false)} title={editingQuiz ? "Edit Quiz" : "Create New Quiz"} size="lg"><QuizForm quiz={editingQuiz} onFormSubmit={handleFormSubmit} /></Modal>
            <Modal show={showResultsModal} handleClose={() => setShowResultsModal(false)} title={`Results: ${selectedQuiz?.title || ''}`} size="xl">
                {isResultsLoading ? <Loader /> : selectedQuizResults ? (
                    <div>
                        {selectedQuizResults.submissions.length === 0 ? (
                            <Alert variant="info">No students have submitted this quiz yet.</Alert>
                        ) : (
                            <>
                                <h5 className="mb-3 text-light">Analytics Overview</h5>
                                <Row className="mb-3 text-center">
                                    <Col md={4}><Card className="bg-light"><Card.Body><Card.Title>Participation</Card.Title><Card.Text as="h4">{selectedQuizResults.analytics.participationRate.toFixed(1)}%</Card.Text></Card.Body></Card></Col>
                                    <Col md={4}><Card className="bg-light"><Card.Body><Card.Title>Average Score</Card.Title><Card.Text as="h4">{selectedQuizResults.analytics.averageScore.toFixed(2)}</Card.Text></Card.Body></Card></Col>
                                    <Col md={4}><Card className="bg-light"><Card.Body><Card.Title>Highest Score</Card.Title><Card.Text as="h4">{selectedQuizResults.analytics.highestScore}</Card.Text></Card.Body></Card></Col>
                                </Row>
                                <h5 className="mb-3 mt-4 text-light">Individual Submissions</h5>
                               <div className="table-responsive">
                                 <Table striped bordered hover size="sm">
                                    <thead><tr><th>Rank</th><th>Student</th><th>Email</th><th>Score</th><th>Submitted On</th></tr></thead>
                                    <tbody>
                                        {selectedQuizResults.submissions.map((sub, index) => (
                                            <tr key={sub._id}>
                                                <td>{index + 1}</td>
                                                <td>{sub.student?.fullName || 'N/A'}</td>
                                                <td>{sub.student?.email || 'N/A'}</td>
                                                <td><strong>{sub.score}</strong></td>
                                                <td>{format(new Date(sub.submittedAt), 'Pp')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                               </div>
                            </>
                        )}
                    </div>
                ) : <Alert variant="danger">Could not load results.</Alert>}
            </Modal>
        </div>
    );
};
export default ManageQuizzes;