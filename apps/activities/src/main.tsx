import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HalloweenActivity } from './activities/HalloweenActivity';
import { CheckinActivity } from './activities/CheckinActivity';
import { MiniGameActivity } from './activities/MiniGameActivity';
import { TeamActivity } from './activities/TeamActivity';
import './index.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/halloween" replace />} />
        <Route path="/halloween" element={<HalloweenActivity />} />
        <Route path="/checkin" element={<CheckinActivity />} />
        <Route path="/mini-game" element={<MiniGameActivity />} />
        <Route path="/team" element={<TeamActivity />} />
        <Route path="*" element={<div style={{ padding: 20 }}>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
