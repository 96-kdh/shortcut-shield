import React from "react";
import ReactDOM from "react-dom/client";

import { Toaster } from "@/components/ui";
import { PopupProvider } from "@/contexts/popup.provider.tsx";
import { ThemeProvider } from "@/contexts/theme.provider.tsx";

import "./index.css";
import Home from "./pages";

const container = document.getElementById("root")!;

ReactDOM.createRoot(container).render(
   <React.StrictMode>
      <ThemeProvider defaultTheme="system">
         <PopupProvider>
            <Home />
            <Toaster richColors />
         </PopupProvider>
      </ThemeProvider>
   </React.StrictMode>,
);
