import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/AMPORA/">
      <GoogleOAuthProvider clientId="1036320353420-nnvlhjidmtj36mucnfu78bu4r5ndotcp.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
