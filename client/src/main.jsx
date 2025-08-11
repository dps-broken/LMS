import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Imports the App component
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import './styles/Auth.css'; // The new style file for auth pages
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// This is the root of your React application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff',
                },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// There should be NO 'export default App;' here.