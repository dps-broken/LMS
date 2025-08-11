import React, { useState, useEffect } from 'react';
import { Card, Col, Row, ListGroup, Badge } from 'react-bootstrap';
import { FiUsers, FiCheckCircle, FiBookOpen, FiAward, FiUserPlus, FiFilePlus, FiEdit } from 'react-icons/fi';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import Loader from '../../components/common/Loader.jsx';
import AdminDashboardStats from '../../components/admin/AdminDashboardStats.jsx';
import { Link } from 'react-router-dom';

// A helper to map event types to icons and colors
const eventIcons = {
    STUDENT_APPROVED: <FiUserPlus className="text-success" />,
    QUIZ_SUBMITTED: <FiEdit className="text-info" />,
    APP_SUBMITTED: <FiFilePlus className="text-primary" />,
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]); // State for the activity feed
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch stats and activities concurrently
                const [statsRes, activitiesRes] = await Promise.all([
                    axiosInstance.get('/api/admin/dashboard-stats'),
                    axiosInstance.get('/api/admin/activities')
                ]);
                setStats(statsRes.data);
                setActivities(activitiesRes.data);
            } catch (error) {
                toast.error('Could not fetch all dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <Loader />;

    return (
        <div>
            <h1>Management Dashboard</h1>
            <p className="text-muted">Welcome to the admin panel. Here you can manage the entire platform.</p>
            
            {stats && <AdminDashboardStats stats={stats} />}
            
            <Row className="mt-4">
                <Col md={7}>
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className='gradient-text-custom'>Recent System Activity</Card.Title>
                            {activities.length > 0 ? (
                                <ListGroup variant="flush">
                                    {activities.map(activity => (
                                        <ListGroup.Item key={activity._id} className="d-flex justify-content-between align-items-start bg-transparent">
                                            <div className="me-3 fs-4">
                                                {eventIcons[activity.eventType] || <FiCheckCircle />}
                                            </div>
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold text-light">{activity.message}</div>
                                                <span className="text-muted small">
                                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted">No recent activity to display.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                 <Col md={5}>
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className='gradient-text-custom'>Quick Actions</Card.Title>
                            <Card.Text>Perform common tasks quickly from here.</Card.Text>
                             <Link to="/admin/students" className="btn btn-primary me-2 mb-2">Manage Students</Link>
                             <Link to="/admin/applications" className="btn btn-secondary me-2 mb-2">View Applications</Link>
                             <Link to="/admin/schedule" className="btn btn-tertiary me-2 mb-2">Schedule Class</Link>
                             <Link to="/admin/notifications" className="btn btn-quaternary me-2 mb-2">Send Notification</Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;