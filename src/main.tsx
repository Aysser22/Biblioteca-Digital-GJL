import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { WalletAdapterProvider } from './solana/WalletAdapterProvider';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletAdapterProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WalletAdapterProvider>
  </React.StrictMode>
);

