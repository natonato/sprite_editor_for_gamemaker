import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import BottomBtn from './components/BottomBtn';
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
            <BottomBtn />
            <Footer />
        </div>
    );
}

export default App;
