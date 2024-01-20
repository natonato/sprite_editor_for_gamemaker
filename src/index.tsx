import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'App';
import { BrowserRouter } from 'react-router-dom';

const rootNode: HTMLElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootNode).render(
    <React.StrictMode>
        <BrowserRouter basename="/react-frame">
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
