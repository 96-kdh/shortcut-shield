import React, { createContext, useEffect, useState } from "react";
import browser from "webextension-polyfill";

import type { CommandType } from "@/types";

const popupStorageKey = "shortcut-shield-popup-storage";

export enum PopupTab {
   DoNothing = "Do Nothing",
   Custom = "Custom",
}
export enum PopupView {
   Index = "Index",
   DoNothingNewCommand = "DoNothingNewCommand",
   CustomNewCommand = "CustomNewCommand",
}

interface PopupStorage {
   tab: PopupTab;
   view: PopupView;
   viewProps: PopupViewProps;
}

interface PopupViewPropsCommand {
   value: CommandType;
   type: "readOnly" | "writable";
}

interface PopupViewProps {
   command?: PopupViewPropsCommand;
   urls?: string[];
   script?: string;
}

type PopupProviderState = {
   currentTab: PopupTab;
   setCurrentTab: (value: PopupTab) => void;

   currentView: PopupView;
   setCurrentView: (value: PopupView, props?: PopupViewProps) => void;

   currentViewProps: PopupViewProps;
   setCurrentViewProps: (props: PopupViewProps) => void;
};

const initialState: PopupProviderState = {
   currentTab: PopupTab.DoNothing,
   setCurrentTab: () => {},

   currentView: PopupView.Index,
   setCurrentView: () => {},

   currentViewProps: {
      command: undefined,
      urls: undefined,
      script: undefined,
   },
   setCurrentViewProps: () => {},
};

export const PopupProviderContext = createContext<PopupProviderState>(initialState);

export function PopupProvider({ children, ...props }: { children: React.ReactNode }) {
   const [tab, setTab] = useState<PopupTab>(initialState.currentTab);
   const [view, setView] = useState<PopupView>(initialState.currentView);

   const [viewPropsCommand, setViewPropsCommand] = useState<PopupViewPropsCommand | undefined>(undefined);
   const [viewPropsUrls, setViewPropsUrls] = useState<string[] | undefined>(undefined);
   const [viewPropsScript, setViewPropsScript] = useState<string | undefined>(undefined);

   useEffect(() => {
      browser.storage.local.get([popupStorageKey]).then((values) => {
         const value: PopupStorage | undefined = values[popupStorageKey];

         console.log("value: ", value);

         if (value?.tab) setTab(value.tab);
         if (value?.view) setView(value.view);
         if (value?.viewProps) {
            setViewPropsCommand(value.viewProps.command);
            setViewPropsUrls(value.viewProps.urls);
            setViewPropsScript(value.viewProps.script);
         }
      });
   }, []);

   useEffect(() => {
      const unMountHandler = () => {
         browser.storage.local
            .set({
               [popupStorageKey]: {
                  tab,
                  view,
                  viewProps: {
                     command: viewPropsCommand,
                     urls: viewPropsUrls,
                     script: viewPropsScript,
                  },
               },
            })
            .catch(console.error);
      };

      console.log("viewPropsCommand: ", viewPropsCommand);
      console.log("viewPropsScript: ", viewPropsScript);
      console.log("viewPropsUrls: ", viewPropsUrls);

      window.addEventListener("unload", unMountHandler);

      return () => {
         window.removeEventListener("unload", unMountHandler);
      };
   }, [tab, view, viewPropsCommand, viewPropsScript, viewPropsUrls]);

   const value = {
      currentTab: tab,
      setCurrentTab: setTab,

      currentView: view,
      setCurrentView: (nextView: PopupView, props?: PopupViewProps) => {
         setView(nextView);

         // 사용자가 이동할 때마다 props 초기화
         if (props?.command) setViewPropsCommand(props.command);
         else if (props?.urls) setViewPropsUrls(props.urls);
         else if (props?.script) setViewPropsScript(props.script);
         else {
            setViewPropsCommand(undefined);
            setViewPropsUrls(undefined);
            setViewPropsScript(undefined);
         }
      },

      currentViewProps: {
         command: viewPropsCommand,
         urls: viewPropsUrls,
         script: viewPropsScript,
      },
      setCurrentViewProps: (props?: PopupViewProps) => {
         if (props?.command) setViewPropsCommand(props.command);
         else if (props?.urls) setViewPropsUrls(props.urls);
         else if (props?.script) setViewPropsScript(props.script);
      },
   };

   return (
      <PopupProviderContext.Provider {...props} value={value}>
         {children}
      </PopupProviderContext.Provider>
   );
}
