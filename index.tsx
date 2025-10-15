
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { arbitrum } from 'thirdweb/chains';
import App from './App';
import './src/styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const queryClient = new QueryClient();

const client = createThirdwebClient({ clientId: (import.meta as any).env?.VITE_THIRDWEB_CLIENT_ID || '' });

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider client={client} activeChain={arbitrum}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThirdwebProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
