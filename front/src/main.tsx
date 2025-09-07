import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import App from "./App";

// Import Mantine base styles so components render correctly
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      <Notifications />
      <BrowserRouter>
        <UserProvider>
          <App />
        </UserProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
