import { useContext } from "react";

import { PopupProviderContext } from "@/contexts/popup.provider.tsx";

export const usePopup = () => {
   const context = useContext(PopupProviderContext);

   if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

   return context;
};
