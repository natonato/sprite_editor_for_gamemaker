import React from "react";
import ReactDOM from "react-dom/client";
import "index.scss";
import App from "App";
import { BrowserRouter } from "react-router-dom";
import json from "../package.json";

const rootNode: HTMLElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(rootNode).render(
  <React.StrictMode>
    <BrowserRouter basename={json.homepage}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
