import React from "react";
import ReactDOM from "react-dom/client";
import App from './components/App';

import "./index.css";
import {BrowserRouter} from "react-router-dom";

const rootElement = document.getElementById("app")
if (!rootElement) throw new Error("Failed to find the root element")

const root = ReactDOM.createRoot(rootElement)

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);