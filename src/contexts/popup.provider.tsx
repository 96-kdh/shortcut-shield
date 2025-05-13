import React, { createContext, useState } from "react";

import type { CommandType } from "@/types";

export enum PopupTab {
   DoNothing = "Do Nothing",
   Custom = "Custom",
}
export enum PopupView {
   Index = "Index",
   DoNothingNewCommand = "DoNothingNewCommand",
   CustomNewCommand = "CustomNewCommand",
}

type PopupProviderState = {
   currentTap: PopupTab;
   setCurrentTap: (value: PopupTab) => void;

   currentView: PopupView;
   currentViewProps: {
      command?: CommandType;
   };
   setCurrentView: (value: PopupView, props?: { command?: CommandType }) => void;
};

const initialState: PopupProviderState = {
   currentTap: PopupTab.DoNothing,
   setCurrentTap: () => {},

   currentView: PopupView.Index,
   currentViewProps: {},
   setCurrentView: () => {},
};

export const PopupProviderContext = createContext<PopupProviderState>(initialState);

export function PopupProvider({ children, ...props }: { children: React.ReactNode }) {
   const [tab, setTab] = useState<PopupTab>(initialState.currentTap);
   const [view, setView] = useState<PopupView>(initialState.currentView);
   const [viewProps, setViewProps] = useState<{ command?: CommandType }>({});

   const value = {
      currentTap: tab,
      setCurrentTap: setTab,

      currentView: view,
      currentViewProps: viewProps,
      setCurrentView: (nextView: PopupView, props?: { command?: CommandType }) => {
         setView(nextView);
         if (props) setViewProps(props);
         else setViewProps({});
      },
   };

   return (
      <PopupProviderContext.Provider {...props} value={value}>
         {children}
      </PopupProviderContext.Provider>
   );
}
