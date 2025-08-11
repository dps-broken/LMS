import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { format } from 'date-fns';

const AttendanceCalendar = ({ records }) => {
    if (!records || records.length === 0) {
        return <p className='text-secondary'>No attendance records found.</p>;
    }
    
    // Simple list view styled to represent a calendar log
    return (
        <Table hover>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Class Topic</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {records.map((record, index) => (
                    <tr key={index}>
                        <td>{format(new Date(record.date), 'PPP')}</td>
                        <td>{record.topic}</td>
                        <td>
                            {record.status === 'present' ? (
                                <Badge bg="success">Present</Badge>
                            ) : (
                                <Badge bg="danger">Absent</Badge>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default AttendanceCalendar;