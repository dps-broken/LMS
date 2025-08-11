import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiCheckSquare, FiFileText, FiBriefcase, FiEdit } from 'react-icons/fi';

/**
 * A reusable card component for the dashboard grid.
 */
const DashboardCard = ({ to, icon, title, text }) => (
    <Col lg={4} md={6} className="mb-4">
        <Link to={to} className="text-decoration-none">
            <Card className="h-100 shadow-sm dashboard-card">
                <Card.Body className="d-flex flex-column align-items-center text-center">
                    <div className="card-icon mb-3">{icon}</div>
                    <Card.Title as="h5" className="mb-2">{title}</Card.Title>
                    <Card.Text className="text-muted">{text}</Card.Text>
                </Card.Body>
            </Card>
        </Link>
    </Col>
);

/**
 * The main dashboard page for logged-in students.
 * Provides a welcome message and quick-access cards to major platform features.
 * Includes a dynamic section to show a "Mark Present" button for active classes.
 */
const StudentDashboard = () => {
    const { userInfo } = useAuth();
    // State to hold the schedule object of a currently active class
    const [activeSchedule, setActiveSchedule] = useState(null);
    // State to manage the loading state of the "Mark Present" button
    const [isMarking, setIsMarking] = useState(false);

    // This effect runs on component mount and periodically checks for active attendance sessions.
    useEffect(() => {
        const checkForActiveAttendance = async () => {
            try {
                // Call the new backend endpoint
                const { data } = await axiosInstance.get('/api/student/attendance/active');
                // If data is returned, it means there's an active session
                setActiveSchedule(data);
            } catch (error) {
                // Fail silently. The student doesn't need to know about check failures.
                console.error("Could not check for active attendance sessions.", error);
            }
        };

        checkForActiveAttendance(); // Check immediately on page load
        
        // Set up a polling interval to check every 60 seconds.
        const interval = setInterval(checkForActiveAttendance, 60000);
        
        // Clean up the interval when the component unmounts to prevent memory leaks.
        return () => clearInterval(interval);

    }, []); // Empty dependency array ensures this effect runs only once on mount.

    /**
     * Handles the click event for the "Mark Present" button.
     */
    const handleMarkAttendance = async () => {
        if (!activeSchedule) return; // Safety check
        setIsMarking(true);
        try {
            const { data } = await axiosInstance.post(`/api/student/attendance/${activeSchedule._id}/mark`);
            toast.success(data.message || 'Attendance marked successfully!');
            setActiveSchedule(null); // Hide the button on success to prevent re-submission.
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to mark attendance.');
            // If the error is "already marked", hide the button.
            if(err.response?.status === 400){
                setActiveSchedule(null);
            }
        } finally {
            setIsMarking(false);
        }
    };

    return (
        <div>
            <style>
            {`
                .dashboard-card {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .dashboard-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
                }
                .card-icon {
                    font-size: 2.5rem;
                    color: var(--primary-color);
                }
            `}
            </style>
            
            <div className="mb-4">
                <h1>Welcome, {userInfo.fullName}!</h1>
                <p className="text-muted">This is your personal dashboard. Access your resources and track your progress.</p>
            </div>

            {/* Prominent banner for marking attendance when a session is active */}
            {activeSchedule && (
                <Alert variant="success" className="d-flex justify-content-between align-items-center mb-4 shadow-lg">
                    <div>
                        <Alert.Heading>Attendance Marking is Now Open!</Alert.Heading>
                        <p className="mb-0">
                            Please mark your attendance for the class: <strong>{activeSchedule.topic}</strong>
                        </p>
                    </div>
                    <Button 
                        variant="light" 
                        size="lg" 
                        onClick={handleMarkAttendance}
                        disabled={isMarking}
                        className="fw-bold"
                    >
                        {isMarking ? 'Submitting...' : 'Mark Present'}
                    </Button>
                </Alert>
            )}
            
            <Row>
                <DashboardCard to="/quizzes" icon={<FiBookOpen />} title="My Quizzes" text="View upcoming, active, and completed quizzes." />
                <DashboardCard to="/schedule" icon={<FiCalendar />} title="Class Schedule" text="Check your upcoming classes and join meetings." />
                <DashboardCard to="/attendance" icon={<FiCheckSquare />} title="Attendance History" text="View your past attendance records and percentage." />
                <DashboardCard to="/documents" icon={<FiFileText />} title="My Documents" text="Access your certificates and offer letters." />
                <DashboardCard to="/profile" icon={<FiEdit />} title="Edit Profile" text="Update your personal details and password." />
            </Row>
        </div>
    );
};

export default StudentDashboard;