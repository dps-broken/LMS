import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import AttendanceCalendar from '../../components/student/AttendanceCalendar';

const StudentAttendance = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get('/api/student/attendance/summary');
                setSummary(data);
            } catch (err) {
                toast.error("Failed to fetch attendance summary.");
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <Loader />;
    if (!summary) return <p>Could not load attendance data.</p>;

    return (
        <div>
            <h1>My Attendance</h1>
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Overall Percentage</Card.Title>
                            <ProgressBar 
                                now={summary.percentageAttended} 
                                label={`${summary.percentageAttended}%`} 
                                variant="success" 
                                style={{ height: '30px' }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Attendance Stats</Card.Title>
                            <p className="mb-1 text-light"><strong>Total Classes Attended:</strong> {summary.totalClassesAttended}</p>
                            <p className="mb-0 text-light"><strong>Total Classes Scheduled:</strong> {summary.totalClassesScheduled}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h3 className='text-light'>Attendance Log</h3>
            <p className='text-light'>Here is a detailed list of all your scheduled classes and your attendance status.</p>
            <AttendanceCalendar records={summary.attendanceRecords} />
        </div>
    );
};
export default StudentAttendance;