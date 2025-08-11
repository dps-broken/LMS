import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { Table, Form, Row, Col, Button } from 'react-bootstrap';
import { format } from 'date-fns';

const ManageAttendance = () => {
    const [records, setRecords] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [filterScheduleId, setFilterScheduleId] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSchedules, setLoadingSchedules] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            setLoadingSchedules(true);
            try {
                const { data } = await axiosInstance.get('/api/admin/schedule');
                setSchedules(data);
            } catch (err) {
                toast.error("Could not fetch class schedules.");
            } finally {
                setLoadingSchedules(false);
            }
        };
        fetchSchedules();
    }, []);

    const fetchAttendance = async () => {
        if (!filterScheduleId) return;
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/admin/attendance`, {
                params: { scheduleId: filterScheduleId }
            });
            setRecords(data);
        } catch (error) {
            toast.error("Failed to fetch attendance records.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleExport = () => {
        // Logic to convert `records` to CSV and download
        toast.success("Export functionality to be implemented.");
    };

    return (
        <div>
            <h1>Attendance Monitoring</h1>
            <p className='text-light'>Select a class to view its attendance record.</p>

            <Row className="align-items-end mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className='text-light'>Select Class Schedule</Form.Label>
                        <Form.Select value={filterScheduleId} onChange={e => setFilterScheduleId(e.target.value)} disabled={loadingSchedules}>
                            <option value="">-- {loadingSchedules ? 'Loading Schedules...' : 'Select a Class'} --</option>
                            {schedules.map(s => (
                                // --- THIS IS THE FIX ---
                                // Use optional chaining (?.) to prevent crash if batch is null
                                <option key={s._id} value={s._id}>
                                    {s.topic} - {s.batch?.name || 'N/A'} ({format(new Date(s.startTime), 'Pp')})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col>
                    <Button onClick={fetchAttendance} disabled={!filterScheduleId || loading}>View Attendance</Button>
                </Col>
                 <Col className="text-end">
                    <Button variant="secondary" onClick={handleExport} disabled={records.length === 0}>Export as CSV</Button>
                </Col>
            </Row>

            {loading ? <Loader /> : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => (
                            // Add optional chaining here as well for safety
                            <tr key={record._id}>
                                <td>{record.student?.fullName || 'N/A'}</td>
                                <td>{record.student?.email || 'N/A'}</td>
                                <td>{format(new Date(record.createdAt), 'Pp')}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            {records.length === 0 && !loading && <p className='text-light'> No attendance records found for the selected class.</p>}
        </div>
    );
};
export default ManageAttendance;