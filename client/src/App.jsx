import React from 'react';
import { useTheme } from './hooks/useTheme.jsx';
import AppRouter from './routes/AppRouter.jsx';
import './styles/App.css';

function App() {
  const { theme } = useTheme();

  return (
    <div id="app-container" data-theme={theme}>
      <AppRouter />
    </div>
  );
}

export default App;