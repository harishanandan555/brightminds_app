import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import api from './api/axios';
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import Planning from "./pages/Planning.jsx";
import "./styles/base.css";

const routes = {
  "/": <Home />,
  "/login": <Login />,
  "/register": <Register />,
  "/dashboard": <Dashboard />,
  "/parent": <ParentDashboard />,
  "/planning": <Planning />,
};

const normalizePath = (path = window.location.pathname) => {
  if (path === "/") {
    return path;
  }
  return path.replace(/\/+$/, "") || "/";
};

function AppRouter() {
  const [pathname, setPathname] = useState(() => normalizePath());

  // Fix for lost token on refresh
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

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
    window.appNavigate = (path, state = {}) => {
      if (!path) return;
      window.history.pushState(state, "", path);
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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRouter />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);

