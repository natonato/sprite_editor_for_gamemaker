import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';

function App() {
    return (
        <div className="App">
            <Header />
            <Routes>
                <Route path="/" element={<Page1 />} />
                <Route path="/test" element={<Page2 />} />
            </Routes>
        </div>
    );
}

export default App;
