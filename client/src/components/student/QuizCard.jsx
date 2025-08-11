import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const QuizCard = ({ quiz, status }) => {
    const getStatusVariant = () => {
        if (quiz.notAttempted) return 'danger';
        switch (status) {
            case 'active': return 'success';
            case 'upcoming': return 'warning';
            case 'completed': return 'primary';
            default: return 'info';
        }
    };

    const renderButton = () => {
        if (quiz.notAttempted) {
            return <Button variant="secondary" disabled>Missed</Button>;
        }
        switch (status) {
            case 'active':
                return <Button as={Link} to={`/quizzes/attempt/${quiz._id}`} variant="success">Start Quiz</Button>;
            case 'upcoming':
                return <Button variant="outline-secondary" disabled>Starts Soon</Button>;
            case 'completed':
                return <Button as={Link} to={`/quizzes/result/${quiz._id}`} variant="info">View Result</Button>;
            default:
                return null;
        }
    };
    
    return (
        <Card className="mb-3 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-light">{quiz.title}</span>
                <Badge pill bg={getStatusVariant()} className="text-capitalize">{quiz.notAttempted ? 'Missed' : status}</Badge>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    <strong>Time:</strong> {format(new Date(quiz.startTime), 'p')} - {format(new Date(quiz.endTime), 'p')}
                    <br/>
                    <strong>Date:</strong> {format(new Date(quiz.startTime), 'PPP')}
                </Card.Text>

                {/* Display score and percentage if the quiz is completed and was attempted */}
                {status === 'completed' && !quiz.notAttempted && quiz.totalMarks > 0 && (
                    <div className="mb-3">
                        <hr/>
                        <p className="mb-0"><strong className='text-light'>Your Score:</strong>
                            <span className="text-primary fw-bold ms-2">
                                {quiz.score} / {quiz.totalMarks}
                            </span>
                        </p>
                        <p className="mb-0"><strong className='text-light'>Percentage:</strong>
                            <span className="text-success fw-bold ms-2">
                                {((quiz.score / quiz.totalMarks) * 100).toFixed(2)}%
                            </span>
                        </p>
                    </div>
                )}

                {/* {renderButton()} */}
            </Card.Body>
        </Card>
    );
};

export default QuizCard;