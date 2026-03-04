import React from 'react';
import ReactDOM from 'react-dom/client';
import { SasAuthProvider } from './auth';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SasAuthProvider>
      <App />
    </SasAuthProvider>
  </React.StrictMode>
);
