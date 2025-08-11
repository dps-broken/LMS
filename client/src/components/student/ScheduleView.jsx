import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { format, isWithinInterval, addMinutes, subMinutes } from 'date-fns';
import toast from 'react-hot-toast';

const ScheduleView = ({ schedules }) => {

    const handleJoin = (schedule) => {
        if (schedule.meetingLink) {
            window.open(schedule.meetingLink, '_blank');
        }
        if(schedule.meetingId) {
            navigator.clipboard.writeText(`ID: ${schedule.meetingId}, Passcode: ${schedule.passcode || 'N/A'}`);
            toast.success('Meeting ID & Passcode copied to clipboard!');
        }
    };

    const isJoinButtonActive = (startTime, endTime) => {
        const now = new Date();
        const activationTime = subMinutes(new Date(startTime), 15);
        const deactivationTime = addMinutes(new Date(startTime), 30); // Deactivates 30 mins after start
        return isWithinInterval(now, { start: activationTime, end: deactivationTime });
    };

    if (!schedules || schedules.length === 0) {
        return <p className='text-secondary'>You have no scheduled classes.</p>;
    }

    return (
        <Table striped bordered hover responsive>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Topic</th>
                    <th>Instructor</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {schedules.map(schedule => (
                    <tr key={schedule._id}>
                        <td>{format(new Date(schedule.startTime), 'PPP')}</td>
                        <td>{format(new Date(schedule.startTime), 'p')} - {format(new Date(schedule.endTime), 'p')}</td>
                        <td>{schedule.topic}</td>
                        <td>{schedule.instructor}</td>
                        <td>
                            <Button
                                variant="success"
                                onClick={() => handleJoin(schedule)}
                                disabled={!isJoinButtonActive(schedule.startTime, schedule.endTime)}
                                className='btn-quaternary'
                            >
                                Join Class
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default ScheduleView;