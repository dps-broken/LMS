import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import StudentTable from '../../components/admin/StudentTable.jsx';
import { Button, Form, Row, Col, Pagination, ListGroup, Badge, Alert } from 'react-bootstrap';
import Modal from '../../components/common/Modal.jsx';
import StudentForm from '../../components/admin/StudentForm.jsx';
import { format } from 'date-fns';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [filters, setFilters] = useState({ search: '', department: '', batch: '', status: 'active' });

    const fetchStudents = async (page = 1) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/admin/students', { params: { ...filters, page } });
            setStudents(data.students);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            toast.error("Failed to fetch students.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [deptRes, batchRes] = await Promise.all([
                    axiosInstance.get('/api/admin/departments'),
                    axiosInstance.get('/api/admin/batches'),
                ]);
                setDepartments(deptRes.data);
                setBatches(batchRes.data);
            } catch (error) {
                toast.error("Could not load filter options.");
            }
        };
        fetchFilterData();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => fetchStudents(1), 500);
        return () => clearTimeout(handler);
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'department') {
            setFilters(prev => ({ ...prev, department: value, batch: '' }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const openAddModal = () => { setEditingStudent(null); setShowFormModal(true); };
    const openEditModal = (student) => { setEditingStudent(student); setShowFormModal(true); };
    const handleFormSubmit = () => { setShowFormModal(false); fetchStudents(currentPage); };

    const openDetailsModal = async (studentId) => {
        setIsDetailsLoading(true);
        setShowDetailsModal(true);
        try {
            const { data } = await axiosInstance.get(`/api/admin/students/${studentId}/details`);
            setViewingStudent(data);
        } catch (error) {
            toast.error("Could not fetch student details.");
            setShowDetailsModal(false);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleDelete = async (studentId) => {
        const confirmMessage = "Are you sure you want to PERMANENTLY delete this student?\n\nAll of their data will be erased forever. This action cannot be undone.";
        if (window.confirm(confirmMessage)) {
            try {
                await axiosInstance.delete(`/api/admin/students/${studentId}`);
                toast.success('Student permanently deleted.');
                fetchStudents(currentPage);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete student.');
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Manage Students</h1>
                <Button variant="primary" onClick={openAddModal}>Add Student</Button>
            </div>

            <Row className="mb-3 border-bottom border-secondary py-3 ">
                <Col md={4} className="mb-2 mb-md-0"><Form.Control name="search" placeholder="Search by Name or Email..." value={filters.search} onChange={handleFilterChange} /></Col>
                <Col md={3} className="mb-2 mb-md-0"><Form.Select name="department" value={filters.department} onChange={handleFilterChange}><option value="">All Departments</option>{departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</Form.Select></Col>
                <Col md={3} className="mb-2 mb-md-0"><Form.Select name="batch" value={filters.batch} onChange={handleFilterChange}><option value="">All Batches</option>{batches.filter(b => !filters.department || b.department._id === filters.department).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</Form.Select></Col>
                <Col md={2}><Form.Select name="status" value={filters.status} onChange={handleFilterChange}><option value="active">Active</option><option value="inactive">Inactive</option><option value="">All Statuses</option></Form.Select></Col>
            </Row>

            {loading ? <Loader /> : (<StudentTable students={students} onEdit={openEditModal} onDelete={handleDelete} onView={openDetailsModal} />)}
            
            {totalPages > 1 && <Pagination>{/* ... pagination items ... */}</Pagination>}

            <Modal show={showFormModal} handleClose={() => setShowFormModal(false)} title={editingStudent ? "Edit Student" : "Add New Student"}>
                <StudentForm student={editingStudent} onFormSubmit={handleFormSubmit} />
            </Modal>
            
            <Modal show={showDetailsModal} handleClose={() => setShowDetailsModal(false)} title={`Student Details: ${viewingStudent?.profile.fullName || ''}`} size="lg">
                {isDetailsLoading ? <Loader /> : viewingStudent ? (
                    <div>
                        <h5 className='text-secondary'>Profile Information</h5>
                        <ListGroup className="mb-3">
                            <ListGroup.Item className='custom-list'><strong>Email:</strong> {viewingStudent.profile.email}</ListGroup.Item>
                            <ListGroup.Item className='custom-list'><strong>Status:</strong> <Badge bg={viewingStudent.profile.status === 'active' ? 'success' : 'danger'}>{viewingStudent.profile.status}</Badge></ListGroup.Item>
                            <ListGroup.Item className='custom-list'><strong>Department:</strong> {viewingStudent.profile.department?.name}</ListGroup.Item>
                            <ListGroup.Item className='custom-list'><strong>Batch:</strong> {viewingStudent.profile.batch?.name}</ListGroup.Item>
                        </ListGroup>
                        <h5 className="mt-4 text-secondary">Assessment Submissions ({viewingStudent.assessmentSubmissions.length})</h5>
                        {viewingStudent.assessmentSubmissions.length > 0 ? (
                            <Table striped bordered hover size="sm">
                                <thead><tr><th>Assessment</th><th>Submitted On</th><th>Link</th></tr></thead>
                                <tbody>
                                    {viewingStudent.assessmentSubmissions.map(sub => (
                                        <tr key={sub._id}>
                                            <td>{sub.assessment?.name || 'N/A'}</td>
                                            <td>{format(new Date(sub.submittedAt), 'Pp')}</td>
                                            <td><a href={sub.githubLink} target="_blank" rel="noopener noreferrer">View Submission</a></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : <Alert variant="info">No assessments submitted by this student.</Alert>}
                    </div>
                ) : <p>Could not load student details.</p>}
            </Modal>
        </div>
    );
};
export default ManageStudents;