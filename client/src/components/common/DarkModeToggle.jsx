// /client/src/components/common/DarkModeToggle.js
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { FiSun, FiMoon } from 'react-icons/fi';
import { Button } from 'react-bootstrap';

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="outline-secondary" onClick={toggleTheme} className="me-2">
      {theme === 'light' ? <FiMoon /> : <FiSun />}
    </Button>
  );
};
export default DarkModeToggle;

