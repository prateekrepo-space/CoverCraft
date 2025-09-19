import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './HomePage';
import GeneratorPage from './GeneratorPage';

function App() {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: '#22c55e',
              color: 'white',
              fontWeight: 500
            },
            iconTheme: {
              primary: 'white',
              secondary: '#22c55e'
            }
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generator" element={<GeneratorPage />} />
      </Routes>
    </>
  );
}

export default App;