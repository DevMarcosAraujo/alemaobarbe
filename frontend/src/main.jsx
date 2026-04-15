import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1A1A',
            color: '#F5F0E8',
            border: '1px solid #2A2A2A',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#C9A84C', secondary: '#1A1A1A' },
          },
          error: {
            iconTheme: { primary: '#8B0000', secondary: '#F5F0E8' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
