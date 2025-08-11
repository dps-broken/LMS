import React from 'react';
import { Card } from 'react-bootstrap';
import NotificationForm from '../../components/admin/NotificationForm';

const ManageNotifications = () => {
    return (
        <div>
            <h1>Broadcast Notifications</h1>
            <p className='text-secondary'>Send announcements, reminders, and updates to students.</p>
            <Card className="mt-4">
                <Card.Body>
                    <Card.Title>Compose Notification</Card.Title>
                    <NotificationForm />
                </Card.Body>
            </Card>
        </div>
    );
};

export default ManageNotifications;