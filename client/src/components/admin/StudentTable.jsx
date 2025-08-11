import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const StudentTable = ({ students, onEdit, onDelete, onView }) => {
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <Badge bg="success">Active</Badge>;
            case 'inactive': return <Badge bg="danger">Inactive</Badge>;
            case 'pending': return <Badge bg="warning">Pending</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };
    
    return (
        // <div className="dark-table">
            <Table striped bordered hover responsive >
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {students.map(student => (
                    <tr key={student._id}>
                        <td>{student.fullName}</td>
                        <td>{student.email}</td>
                        <td>{student.department?.name || 'N/A'}</td>
                        <td>{student.batch?.name || 'N/A'}</td>
                        <td>{getStatusBadge(student.status)}</td>
                        <td>
                            <Button variant="outline-info" size="sm" onClick={() => onView(student._id)} className="me-2" title="View Details">
                                <FiEye />
                            </Button>
                            <Button variant="outline-primary" size="sm" onClick={() => onEdit(student)} className="me-2" title="Edit Student">
                                <FiEdit />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => onDelete(student._id)} title="Delete Student">
                                <FiTrash2 />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
        // </div>
        
    );
};
export default StudentTable;