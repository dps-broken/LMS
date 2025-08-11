import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { Row, Col, Card } from 'react-bootstrap';
import QuizCard from '../../components/student/QuizCard';

const StudentQuiz = () => {
    const [quizzes, setQuizzes] = useState({ upcoming: [], active: [], completed: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get('/api/student/quizzes');
                setQuizzes(data);
            } catch (err) {
                toast.error("Failed to fetch quizzes.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    if (loading) return <Loader />;

    return (
        <div>
            <h1>My Quizzes</h1>
            <p className='text-secondary'>Here are your quizzes, sorted by their status.</p>

            <Row>
                <Col md={12} lg={4}>
                    <h4 className="text-success">Active</h4>
                    {quizzes.active.length > 0 ? (
                        quizzes.active.map(quiz => <QuizCard key={quiz._id} quiz={quiz} status="active" />)
                    ) : (
                        <p className='text-secondary'>No active quizzes at the moment.</p>
                    )}
                </Col>
                <Col md={12} lg={4}>
                    <h4 className="text-warning">Upcoming</h4>
                    {quizzes.upcoming.length > 0 ? (
                        quizzes.upcoming.map(quiz => <QuizCard key={quiz._id} quiz={quiz} status="upcoming" />)
                    ) : (
                        <p className='text-secondary'>No upcoming quizzes scheduled.</p>
                    )}
                </Col>
                 <Col md={12} lg={4}>
                    <h4 className="text-primary">Completed / Ended</h4>
                    {quizzes.completed.length > 0 ? (
                        quizzes.completed.map(quiz => <QuizCard key={quiz._id} quiz={quiz} status="completed" />)
                    ) : (
                        <p className='text-secondary'>You have not completed any quizzes yet.</p>
                    )}
                </Col>
            </Row>
        </div>
    );
};
export default StudentQuiz;