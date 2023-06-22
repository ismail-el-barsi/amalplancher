import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { ShopProvider } from "./Shop";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const root = createRoot(document.getElementById("root"));
root.render(
  <ShopProvider>
    <HelmetProvider>
      <PayPalScriptProvider deferLoading={true}>
        <App />
      </PayPalScriptProvider>
    </HelmetProvider>
  </ShopProvider>
);
