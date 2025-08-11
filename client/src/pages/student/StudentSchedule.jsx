import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import ScheduleView from '../../components/student/ScheduleView';
import { Form } from 'react-bootstrap';

const StudentSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [filter, setFilter] = useState('all'); // all, today, tomorrow, week
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get('/api/student/schedule');
                setSchedules(data);
                setFilteredSchedules(data); // Initially show all
            } catch (err) {
                toast.error("Failed to fetch schedule.");
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    useEffect(() => {
        // Apply filter logic
        const now = new Date();
        const today = new Date(now.setHours(0,0,0,0));
        const tomorrow = new Date(new Date(today).setDate(today.getDate() + 1));
        const endOfTomorrow = new Date(new Date(tomorrow).setDate(tomorrow.getDate() + 1));
        const endOfWeek = new Date(new Date(today).setDate(today.getDate() + 7));

        if (filter === 'today') {
            setFilteredSchedules(schedules.filter(s => new Date(s.startTime) >= today && new Date(s.startTime) < tomorrow));
        } else if (filter === 'tomorrow') {
            setFilteredSchedules(schedules.filter(s => new Date(s.startTime) >= tomorrow && new Date(s.startTime) < endOfTomorrow));
        } else if (filter === 'week') {
            setFilteredSchedules(schedules.filter(s => new Date(s.startTime) >= today && new Date(s.startTime) < endOfWeek));
        } else {
            setFilteredSchedules(schedules);
        }
    }, [filter, schedules]);

    if (loading) return <Loader />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>My Class Schedule</h1>
                <Form.Group style={{ width: '200px' }}>
                    <Form.Label>Filter View</Form.Label>
                    <Form.Select value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">All Upcoming</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="week">This Week</option>
                    </Form.Select>
                </Form.Group>
            </div>
            <ScheduleView schedules={filteredSchedules} />
        </div>
    );
};
export default StudentSchedule;