import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

// Import the PROVIDER components from your context files
import UserProvider from './context/UserContext.jsx';
import CaptainProvider from './context/CaptainContext.jsx';
import SocketProvider from './context/SocketContext.jsx';

// Get the root element from your HTML
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Render the application with all the context providers
root.render(
  <StrictMode>
    <CaptainProvider>
      <UserProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </UserProvider>
    </CaptainProvider>
  </StrictMode>
);
