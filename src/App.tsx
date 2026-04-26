import React from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "components/layout/Footer";
import Header from "components/layout/Header";
import MainPage from "pages/MainPage";
import RpgMakerPage from "pages/RpgMakerPage";
import CollisionMapPage from "pages/CollisionMapPage";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/rpg-maker" element={<RpgMakerPage />} />
        <Route path="/collision-map" element={<CollisionMapPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
