import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Image } from 'react-bootstrap';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';

const StudentProfile = () => {
    const { userInfo, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [mobileNumber, setMobileNumber] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axiosInstance.get('/api/student/profile');
                setProfile(data);
                setMobileNumber(data.mobileNumber || '');
                setPreviewImage(data.profileImage);
            } catch (err) {
                toast.error("Could not fetch profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword && newPassword !== confirmNewPassword) {
            return setError("New passwords do not match.");
        }
        
        try {
            const payload = { mobileNumber };
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.password = newPassword;
            }
            
            await axiosInstance.put('/api/student/profile', payload);
            toast.success("Profile details updated successfully!");
            if(newPassword) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile.';
            setError(msg);
            toast.error(msg);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleImageUpload = async () => {
        if (!profileImageFile) return;
        const formData = new FormData();
        formData.append('profileImage', profileImageFile);

        try {
            const { data } = await axiosInstance.put('/api/student/profile/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("Profile image updated!");
            // Update the user info in AuthContext to reflect the new image globally
            const updatedUserInfo = { ...userInfo, profileImage: data.profileImage };
            login(updatedUserInfo);
        } catch (err) {
            toast.error(err.response?.data?.message || "Image upload failed.");
        }
    };

    if (loading) return <Loader />;
    if (!profile) return <Alert variant="danger">Could not load profile data.</Alert>;

    return (
        <div>
            <h1>My Profile</h1>
            <Row>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Image src={previewImage} roundedCircle fluid style={{ width: '150px', height: '150px', objectFit: 'cover' }} className="mb-3" />
                            <h4 className='text-light custom-font'>{profile.fullName}</h4>
                            <p className="text-muted">{profile.email}</p>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Control type="file" accept=".jpg,.jpeg,.png" onChange={handleImageChange} />
                            </Form.Group>
                            <Button onClick={handleImageUpload} disabled={!profileImageFile}>Upload Image</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Read-Only Information</Card.Title>
                            <Form>
                                <Row>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Department</Form.Label><Form.Control type="text" value={profile.department.name} readOnly /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Batch</Form.Label><Form.Control type="text" value={profile.batch.name} readOnly /></Form.Group></Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="mt-4">
                        <Card.Body>
                            <Card.Title>Update Your Details</Card.Title>
                             {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleUpdateDetails}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                                </Form.Group>
                                <hr />
                                <p className="text-muted">Change Password</p>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Password</Form.Label>
                                    <Form.Control type="password" placeholder="Required to change password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>New Password</Form.Label>
                                            <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm New Password</Form.Label>
                                            <Form.Control type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit">Update Profile</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
export default StudentProfile;