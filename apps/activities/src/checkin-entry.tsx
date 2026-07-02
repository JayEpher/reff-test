import React from 'react';
import ReactDOM from 'react-dom/client';
import { CheckinActivity } from './activities/CheckinActivity';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CheckinActivity />
  </React.StrictMode>
);
