import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import "./styles/base.css";

const routes = {
  "/": <Home />,
  "/login": <Login />,
  "/dashboard": <Dashboard />,
  "/parent": <ParentDashboard />,
};

const normalizePath = () => {
  const { pathname } = window.location;
  if (pathname === "/") {
    return pathname;
  }
  return pathname.replace(/\/+$/, "") || "/";
};

const pathname = normalizePath();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {routes[pathname] ?? <Home />}
  </React.StrictMode>,
);

