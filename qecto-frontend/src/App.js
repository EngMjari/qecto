// src/App.js
import React, { useContext } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Contexts/AuthContext";
import {
  SiteConfigProvider,
  SiteConfigContext,
} from "./Contexts/SiteConfigContext";
import Router from "./Router";
import LoadingScreen from "./Pages/LoadingScreen/LoadingScreen";

function AppContent() {
  const { loading, siteConfig } = useContext(SiteConfigContext);

  if (loading) {
    return (
      <LoadingScreen
        logoUrl={siteConfig?.logo || "/default-logo.png"}
        primaryColor={siteConfig?.primary_color || "#ff5700"}
        secondaryColor={siteConfig?.secondary_color || "#002a3a"}
      />
    );
  }

  return <Router />;
}

function App() {
  return (
    <BrowserRouter>
      <SiteConfigProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SiteConfigProvider>
    </BrowserRouter>
  );
}

export default App;
