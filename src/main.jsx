import React, { useEffect, useState } from "react";
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

const normalizePath = (path = window.location.pathname) => {
  if (path === "/") {
    return path;
  }
  return path.replace(/\/+$/, "") || "/";
};

function AppRouter() {
  const [pathname, setPathname] = useState(() => normalizePath());

  useEffect(() => {
    const handlePopState = () => setPathname(normalizePath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleLinkClick = (event) => {
      const link = event.target.closest("a[data-route]");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      event.preventDefault();
      window.history.pushState({}, "", href);
      setPathname(normalizePath(href));
    };

    document.body.addEventListener("click", handleLinkClick);
    return () => document.body.removeEventListener("click", handleLinkClick);
  }, []);

  useEffect(() => {
    window.appNavigate = (path) => {
      if (!path) return;
      window.history.pushState({}, "", path);
      setPathname(normalizePath(path));
    };
    return () => {
      delete window.appNavigate;
    };
  }, []);

  return routes[pathname] ?? <Home />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);

