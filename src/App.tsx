import React from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "components/layout/Footer";
import Header from "components/layout/Header";
import MainPage from "pages/MainPage";
import RpgMakerPage from "pages/RpgMakerPage";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/rpg-maker" element={<RpgMakerPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
