import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const QuestionForm = ({ question, onSave, onCancel }) => {
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [marks, setMarks] = useState(1);

    useEffect(() => {
        if (question) {
            setQuestionText(question.questionText);
            setOptions(question.options);
            setCorrectAnswer(question.correctAnswer);
            setMarks(question.marks);
        }
    }, [question]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index) => {
        if (options.length <= 2) return; // Must have at least 2 options
        const removedOptionValue = options[index];
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        // If the removed option was the correct answer, clear the correct answer
        if (correctAnswer === removedOptionValue) {
            setCorrectAnswer('');
        }
    };

    const handleSave = () => {
        // Basic validation
        if (!questionText.trim() || options.some(opt => !opt.trim()) || !correctAnswer || marks <= 0) {
            alert('Please fill all fields, select a correct answer, and provide valid marks.');
            return;
        }
        onSave({ _id: question?._id, questionText, options, correctAnswer, marks });
        // Reset form
        setQuestionText('');
        setOptions(['', '']);
        setCorrectAnswer('');
        setMarks(1);
    };

    return (
        <div className="border p-3 rounded mb-3">
            <Form.Group className="mb-3">
                <Form.Label>Question Text</Form.Label>
                <Form.Control as="textarea" rows={2} value={questionText} onChange={e => setQuestionText(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Options</Form.Label>
                {options.map((option, index) => (
                    <InputGroup className="mb-2" key={index}>
                        <InputGroup.Radio
                            name={`correctAnswer-${question?._id || 'new'}`}
                            value={option}
                            checked={correctAnswer === option}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            aria-label={`Select option ${index + 1} as correct`}
                        />
                        <Form.Control value={option} onChange={e => handleOptionChange(index, e.target.value)} />
                        <Button variant="outline-danger" onClick={() => removeOption(index)} disabled={options.length <= 2}>
                            <FiTrash2 />
                        </Button>
                    </InputGroup>
                ))}
                <Button variant="outline-secondary" size="sm" onClick={addOption}>
                    <FiPlus /> Add Option
                </Button>
            </Form.Group>
             <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={2}>Marks</Form.Label>
                <Col sm={10}>
                    <Form.Control type="number" min="1" value={marks} onChange={e => setMarks(Number(e.target.value))} />
                </Col>
            </Form.Group>
            <div className="d-flex justify-content-end">
                {onCancel && <Button variant="secondary" onClick={onCancel} className="me-2">Cancel</Button>}
                <Button variant="primary" onClick={handleSave}>Save Question</Button>
            </div>
        </div>
    );
};

export default QuestionForm;