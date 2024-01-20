import React from "react";
import ReactDOM from "react-dom/client";
import "index.scss";
import App from "App";
import { BrowserRouter } from "react-router-dom";

const rootNode: HTMLElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(rootNode).render(
  <React.StrictMode>
    <BrowserRouter basename="/tile_sprite_editor_for_gamemaker">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
