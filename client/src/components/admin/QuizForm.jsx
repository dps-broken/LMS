import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import QuestionForm from './QuestionForm';
import { FiPlus } from 'react-icons/fi';

const QuizForm = ({ quiz, onFormSubmit }) => {
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [batch, setBatch] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [questions, setQuestions] = useState([]);
    
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showQuestionForm, setShowQuestionForm] = useState(false);

    useEffect(() => {
        // Fetch departments and batches for dropdowns
        const fetchData = async () => {
            try {
                const [deptRes, batchRes] = await Promise.all([
                    axiosInstance.get('/api/admin/departments'),
                    axiosInstance.get('/api/admin/batches')
                ]);
                setDepartments(deptRes.data);
                setBatches(batchRes.data);
            } catch (err) {
                toast.error("Could not fetch necessary data.");
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (quiz) {
            setTitle(quiz.title);
            setDepartment(quiz.department._id);
            setBatch(quiz.batch._id);
            setStartTime(quiz.startTime.slice(0, 16)); // Format for datetime-local input
            setEndTime(quiz.endTime.slice(0, 16));
            setQuestions(quiz.questions || []);
        } else {
            // Reset form for creation
            setTitle('');
            setDepartment('');
            setBatch('');
            setStartTime('');
            setEndTime('');
            setQuestions([]);
        }
    }, [quiz]);

    const handleQuestionSave = (newQuestion) => {
        setQuestions([...questions, newQuestion]);
        setShowQuestionForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = { title, department, batch, startTime, endTime, questions };
        const endpoint = quiz ? `/api/admin/quizzes/${quiz._id}` : '/api/admin/quizzes';
        const method = quiz ? 'put' : 'post';

        try {
            await axiosInstance[method](endpoint, payload);
            toast.success(`Quiz ${quiz ? 'updated' : 'created'} successfully!`);
            if (onFormSubmit) onFormSubmit();
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to save quiz.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Quiz Title</Form.Label>
                        <Form.Control type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Target Department</Form.Label>
                        <Form.Select value={department} onChange={e => setDepartment(e.target.value)} required>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Target Batch</Form.Label>
                        <Form.Select value={batch} onChange={e => setBatch(e.target.value)} required>
                            <option value="">Select Batch</option>
                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                 <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>End Time</Form.Label>
                        <Form.Control type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                    </Form.Group>
                </Col>
            </Row>
            
            <h5 className="mt-4 text-light">Questions ({questions.length})</h5>
            <hr/>
            {questions.map((q, index) => (
                <Card key={index} className="mb-2">
                    <Card.Body>
                        <p className='text-light'><strong>Q{index+1}: </strong>{q.questionText}</p>
                        {/* Can add edit/delete buttons here */}
                    </Card.Body>
                </Card>
            ))}

            {showQuestionForm && (
                <QuestionForm onSave={handleQuestionSave} onCancel={() => setShowQuestionForm(false)} />
            )}

            <Button variant="secondary" onClick={() => setShowQuestionForm(true)} className="mb-3">
                <FiPlus /> Add Question
            </Button>
            
            <hr/>
            <Button variant="primary" type="submit" disabled={loading} className="w-100">
                {loading ? 'Saving...' : (quiz ? 'Update Quiz' : 'Create Quiz')}
            </Button>
        </Form>
    );
};

export default QuizForm;