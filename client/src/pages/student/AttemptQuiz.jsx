import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { Card, Button, Form, Alert, ProgressBar } from 'react-bootstrap';

const AttemptQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await axiosInstance.get(`/api/student/quizzes/${id}`);
                setQuiz(data);
                const duration = new Date(data.endTime).getTime() - new Date().getTime();
                setTimeLeft(duration > 0 ? duration / 1000 : 0);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load quiz.');
                navigate('/quizzes');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, navigate]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            handleSubmit(); // Auto-submit when timer reaches 0
            return;
        }
        const timerId = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleAnswerChange = (questionId, selectedAnswer) => {
        setAnswers({ ...answers, [questionId]: selectedAnswer });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const submissionData = {
            answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId, selectedAnswer
            }))
        };
        try {
            await axiosInstance.post(`/api/student/quizzes/${id}/submit`, submissionData);
            toast.success("Quiz submitted successfully!");
            navigate('/quizzes');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit quiz.');
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;
    if (!quiz) return <Alert variant="danger">Quiz could not be loaded.</Alert>;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);

    return (
        <div>
            <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between">
                    <h3 className='text-light'>{quiz.title}</h3>
                    <div className="h4 text-danger">{minutes}:{seconds < 10 ? '0' : ''}{seconds}</div>
                </Card.Header>
            </Card>

            {quiz.questions.map((q, index) => (
                <Card key={q._id} className="mb-3">
                    <Card.Body>
                        <Card.Title>Question {index + 1}</Card.Title>
                        <p className='text-light'>{q.questionText}</p>
                        <Form>
                            {q.options.map((option, i) => (
                                <Form.Check
                                    key={i}
                                    type="radio"
                                    id={`q-${q._id}-opt-${i}`}
                                    label={option}
                                    name={`question-${q._id}`}
                                    value={option}
                                    onChange={() => handleAnswerChange(q._id, option)}
                                />
                            ))}
                        </Form>
                    </Card.Body>
                </Card>
            ))}

            <Button onClick={handleSubmit} disabled={submitting} className="w-100" size="lg">
                {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
        </div>
    );
};
export default AttemptQuiz;