import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

/**
 * A form component for Admins to create or edit a class schedule.
 * @param {object} props
 * @param {object} [props.schedule] - The schedule object to edit. If null, the form is in "create" mode.
 * @param {function} props.onFormSubmit - Callback function to execute after a successful form submission.
 */
const ScheduleClassForm = ({ schedule, onFormSubmit }) => {
    // State to hold all form input values
    const [formData, setFormData] = useState({
        topic: '',
        department: '',
        batch: '',
        instructor: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
        meetingId: '',
        passcode: '',
        attendanceWindow: 15, // Default attendance window is 15 minutes
    });

    // State for populating dropdown menus
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);

    // State for handling submission process and errors
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Effect to fetch Departments and Batches when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the authenticated admin endpoints to fetch data for the form
                const [deptRes, batchRes] = await Promise.all([
                    axiosInstance.get('/api/admin/departments'),
                    axiosInstance.get('/api/admin/batches'),
                ]);
                setDepartments(deptRes.data);
                setBatches(batchRes.data);
            } catch (err) {
                toast.error("Could not fetch departments or batches for the form.");
            }
        };
        fetchData();
    }, []);

    // Effect to populate the form fields if a 'schedule' object is passed for editing
    useEffect(() => {
        if (schedule) {
            // "Edit Mode": Populate form with existing schedule data
            setFormData({
                topic: schedule.topic || '',
                department: schedule.department?._id || '',
                batch: schedule.batch?._id || '',
                instructor: schedule.instructor || '',
                // Format dates for the datetime-local input type
                startTime: schedule.startTime ? schedule.startTime.slice(0, 16) : '',
                endTime: schedule.endTime ? schedule.endTime.slice(0, 16) : '',
                meetingLink: schedule.meetingLink || '',
                meetingId: schedule.meetingId || '',
                passcode: schedule.passcode || '',
                attendanceWindow: schedule.attendanceWindow || 15,
            });
        } else {
            // "Create Mode": Reset form to default empty values
            setFormData({
                topic: '', department: '', batch: '', instructor: '',
                startTime: '', endTime: '', meetingLink: '', meetingId: '', 
                passcode: '', attendanceWindow: 15,
            });
        }
    }, [schedule]); // This effect re-runs whenever the schedule prop changes

    // Generic handler to update form state on input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Determine if we are creating (POST) or updating (PUT)
        const endpoint = schedule ? `/api/admin/schedule/${schedule._id}` : '/api/admin/schedule';
        const method = schedule ? 'put' : 'post';

        try {
            await axiosInstance[method](endpoint, formData);
            toast.success(`Class ${schedule ? 'updated' : 'scheduled'} successfully!`);
            if (onFormSubmit) {
                onFormSubmit(); // Trigger the parent component's callback (e.g., close modal, refresh list)
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to save class schedule.';
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
                        <Form.Label>Class Topic</Form.Label>
                        <Form.Control type="text" name="topic" value={formData.topic} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Select name="department" value={formData.department} onChange={handleChange} required>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Batch</Form.Label>
                        <Form.Select name="batch" value={formData.batch} onChange={handleChange} required>
                            <option value="">Select Batch</option>
                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                 <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Instructor</Form.Label>
                        <Form.Control type="text" name="instructor" value={formData.instructor} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>End Time</Form.Label>
                        <Form.Control type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Meeting Link (Optional)</Form.Label>
                        <Form.Control type="url" name="meetingLink" value={formData.meetingLink} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Meeting ID (Optional)</Form.Label>
                        <Form.Control type="text" name="meetingId" value={formData.meetingId} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Passcode (Optional)</Form.Label>
                        <Form.Control type="text" name="passcode" value={formData.passcode} onChange={handleChange} />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Attendance Window (Minutes)</Form.Label>
                        <Form.Control 
                            type="number" 
                            name="attendanceWindow" 
                            value={formData.attendanceWindow} 
                            onChange={handleChange} 
                            min="1"
                            required 
                        />
                        <Form.Text  className="text-light">
                            Duration after class starts for students to mark attendance.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={loading} className="mt-3 w-100">
                {loading ? 'Saving...' : (schedule ? 'Update Class' : 'Schedule Class')}
            </Button>
        </Form>
    );
};

export default ScheduleClassForm;