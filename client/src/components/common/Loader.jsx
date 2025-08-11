// /client/src/components/common/Loader.js
import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ size = 'md' }) => {
    return (
        <div className="loader-container">
            <Spinner animation="border" role="status" size={size}>
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
};
export default Loader;

