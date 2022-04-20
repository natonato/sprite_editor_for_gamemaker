import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Footer from 'components/layout/Footer';
import Header from 'components/layout/Header';
import BottomBtn from 'components/layout/BottomBtn';
import Page1 from 'pages/Page1';
import Page2 from 'pages/Page2';
import Page3 from 'pages/Page3';

function App() {
    return (
        <div className="App">
            <Header />
            <Routes>
                <Route path="/" element={<Page1 />} />
                <Route path="/test" element={<Page2 />} />
                <Route path="/horizontal_scroll" element={<Page3 />} />
            </Routes>
            <BottomBtn />
            <Footer />
        </div>
    );
}

export default App;
