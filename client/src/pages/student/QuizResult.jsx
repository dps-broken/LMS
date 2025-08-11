import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import { Card, Row, Col, ListGroup, Badge, Alert, Button } from 'react-bootstrap';
import { format } from 'date-fns';
import { FiCheck, FiX } from 'react-icons/fi';

const QuizResult = () => {
    const { id } = useParams(); // This is the Quiz ID from the URL
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get(`/api/student/quizzes/${id}/result`);
                setResultData(data);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Could not fetch quiz result.');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (loading) return <Loader />;

    if (!resultData) {
        return (
            <Alert variant="warning">
                <h4>Result Not Available</h4>
                <p>
                    Could not load result data. This may be because the results have not been published by the administrator yet.
                </p>
                <hr />
                <div className="d-flex justify-content-end">
                    <Link to="/quizzes" className="btn btn-primary">
                        Back to Quizzes
                    </Link>
                </div>
            </Alert>
        );
    }

    const { quiz, result, rank } = resultData;
    const totalMarks = quiz.questions.reduce((acc, q) => acc + q.marks, 0);
    const percentage = totalMarks > 0 ? ((result.score / totalMarks) * 100).toFixed(2) : 0;
    const userAnswersMap = new Map(result.answers.map(a => [a.questionId, a.selectedAnswer]));

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Result: {quiz.title}</h1>
                <Link to="/quizzes" className="btn btn-secondary">Back to Quizzes</Link>
            </div>

            <Row className="mb-4">
                <Col md={4} className="mb-3 mb-md-0"><Card className="text-center h-100"><Card.Body>
                    <Card.Title>Score</Card.Title>
                    <Card.Text as="h2" className="text-primary">{result.score} / {totalMarks}</Card.Text>
                </Card.Body></Card></Col>
                <Col md={4} className="mb-3 mb-md-0"><Card className="text-center h-100"><Card.Body>
                    <Card.Title>Percentage</Card.Title>
                    <Card.Text as="h2" className="text-success">{percentage}%</Card.Text>
                </Card.Body></Card></Col>
                <Col md={4} className="mb-3 mb-md-0"><Card className="text-center h-100"><Card.Body>
                    <Card.Title>Your Rank</Card.Title>
                    <Card.Text as="h2" className="text-info">{rank}</Card.Text>
                </Card.Body></Card></Col>
            </Row>

            <Card>
                <Card.Header as="h5">Attempt Details</Card.Header>
                <ListGroup variant="flush">
                    <ListGroup.Item><strong>Attempted On:</strong> {format(new Date(result.submittedAt), 'PPP p')}</ListGroup.Item>
                </ListGroup>
            </Card>

            <h3 className="mt-5">Answer Review</h3>
            {quiz.questions.map((question, index) => {
                const userAnswer = userAnswersMap.get(question._id);
                const isCorrect = userAnswer === question.correctAnswer;
                return (
                    <Card key={question._id} className="mb-3">
                        <Card.Header>Question {index + 1} ({question.marks} Marks)</Card.Header>
                        <Card.Body>
                            <p className="lead">{question.questionText}</p>
                            <ListGroup>
                                {question.options.map((option, i) => {
                                    let variant = '';
                                    if (option === question.correctAnswer) variant = 'success';
                                    else if (option === userAnswer && !isCorrect) variant = 'danger';
                                    
                                    return (
                                        <ListGroup.Item key={i} variant={variant} className="d-flex justify-content-between align-items-center">
                                            {option}
                                            <span>
                                                {option === userAnswer && (isCorrect ? <FiCheck className="text-success"/> : <FiX className="text-danger"/>)}
                                                {option === question.correctAnswer && <Badge bg="success" className="ms-2">Correct Answer</Badge>}
                                            </span>
                                        </ListGroup.Item>
                                    );
                                })}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                );
            })}
        </div>
    );
};

export default QuizResult;