
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FiUsers, FiCheckCircle, FiClock, FiBookOpen, FiAward } from 'react-icons/fi';

const StatCard = ({ icon, title, value, color }) => (
    <Card className={`shadow-sm border-start border-5 border-${color}`}>
        <Card.Body className="d-flex align-items-center">
            <div className={`text-${color} me-3`}>{icon}</div>
            <div>
                <div className="text-muted text-uppercase">{title}</div>
                <div className="h4 fw-bold">{value}</div>
            </div>
        </Card.Body>
    </Card>
);

const AdminDashboardStats = ({ stats }) => {
    return (
        <Row>
            <Col md={6} lg={3} className="mb-4">
                <StatCard icon={<FiUsers size={32} />} title="Total Students" value={stats.totalStudents} color="primary" />
            </Col>
            <Col md={6} lg={3} className="mb-4">
                <StatCard icon={<FiCheckCircle size={32} />} title="Attendance Rate (Today)" value={`${stats.attendanceRate}%`} color="success" />
            </Col>
             <Col md={6} lg={3} className="mb-4">
                <StatCard icon={<FiBookOpen size={32} />} title="Active Quizzes" value={stats.activeQuizzes} color="warning" />
            </Col>
            <Col md={6} lg={3} className="mb-4">
                <StatCard icon={<FiAward size={32} />} title="Internships Accepted" value={stats.internshipsAccepted} color="info" />
            </Col>
        </Row>
    );
};
export default AdminDashboardStats;

