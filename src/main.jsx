import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import api, { injectStore } from './api/axios';
import { fetchBetaStatus } from './store/slices/betaSlice';

// Inject store into axios interceptors
injectStore(store);

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import Planning from "./pages/Planning.jsx";
import BetaAgreement from "./pages/BetaAgreement.jsx";
import BetaConfirmation from "./pages/BetaConfirmation.jsx";
import "./styles/base.css";

const routes = {
  "/": <Home />,
  "/login": <Login />,
  "/register": <Register />,
  "/dashboard": <Dashboard />,
  "/parent": <ParentDashboard />,
  "/planning": <Planning />,
  "/beta-agreement": <BetaAgreement />,
  "/beta-confirmation": <BetaConfirmation />,
};

const normalizePath = (path = window.location.pathname) => {
  if (path === "/") {
    return path;
  }
  return path.replace(/\/+$/, "") || "/";
};

// Guard component to enforce beta agreement
function BetaGuard({ children }) {
  const dispatch = useDispatch();
  const { hasAccepted, hasSeenConfirmation, loading, statusChecked } = useSelector((state) => state.beta);
  const { token, role } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If we have a token but haven't checked status yet (or need to re-verify)
    if (token) {
      // Always fetch fresh status on mount of protected route to be safe
      // or at least if not checked recently. 
      // For now, let's rely on basic check.
      if (!statusChecked) {
        dispatch(fetchBetaStatus()).finally(() => setIsChecking(false));
      } else {
        setIsChecking(false);
      }
    } else {
      setIsChecking(false);
    }
  }, [token, statusChecked, dispatch]);

  if (!token) {
    // If not logged in, strict routes might redirect to login, but here we just let it pass 
    // (AppRouter logic or component-level logic handles auth redirect usually)
    // But since this is BetaGuard for *protected* routes, we assume we want them logged in.
    // simpler: Let the protected component handle "not logged in" or redirect to login.
    // For this specific task, we focus on Beta.
    return children;
  }

  if (loading || isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#64748b',
        fontFamily: 'system-ui, sans-serif'
      }}>
        Checking account status...
      </div>
    );
  }

  // If status is checked and not accepted, redirect to agreement
  // Exception: If they are ON the agreement page or confirmation page, handled by AppRouter logic below
  if (!hasAccepted) {
    // We can't easily "redirect" inside this render without causing loop if not careful.
    // But AppRouter handles which component to render.
    // If we are wrapping Dashboard, and render BetaRouter instead?
    // Better mechanism: Effect redirect.
    return <BetaRedirect target="/beta-agreement" />;
  }

  return children;
}

// Helper to perform navigation effect
function BetaRedirect({ target }) {
  useEffect(() => {
    if (window.appNavigate) {
      window.appNavigate(target);
    }
  }, [target]);
  return null;
}

function AppRouter() {
  const [pathname, setPathname] = useState(() => normalizePath());

  // Fix for lost token on refresh
  const token = useSelector((state) => state.auth.token);
  const { hasAccepted } = useSelector((state) => state.beta);

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

  // Protected routes that require Beta Acceptance
  const protectedRoutes = ["/dashboard", "/parent", "/planning"];
  const isProtected = protectedRoutes.includes(pathname);

  // If path is protected, wrap in BetaGuard
  if (isProtected) {
    return (
      <BetaGuard>
        {routes[pathname] ?? <Home />}
      </BetaGuard>
    );
  }

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

