import React, { createContext, useEffect, useState } from "react";
import browser from "webextension-polyfill";

import type { CommandType } from "@/types";

const popupStorageKey = "shortcut-shield-popup-storage";

export enum PopupTab {
   DoNothing = "Do Nothing",
   Custom = "Custom",
   Extension = "Extension",
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
   urls: string[];
   script?: string;
   scriptDescription?: string;
}

type PopupProviderState = {
   currentTab: PopupTab;
   setCurrentTab: (value: PopupTab) => void;

   currentView: PopupView;
   setCurrentView: (value: PopupView, props?: PopupViewProps) => void;

   currentViewProps: PopupViewProps;
   setCurrentViewProps: {
      command: (_?: PopupViewPropsCommand) => void;
      urls: (_: string[]) => void;
      script: (_?: string) => void;
      scriptDescription: (_?: string) => void;
   };
};

const initialState: PopupProviderState = {
   currentTab: PopupTab.DoNothing,
   setCurrentTab: () => {},

   currentView: PopupView.Index,
   setCurrentView: () => {},

   currentViewProps: {
      command: undefined,
      urls: [""],
      script: undefined,
      scriptDescription: undefined,
   },
   setCurrentViewProps: {
      command: () => {},
      urls: () => {},
      script: () => {},
      scriptDescription: () => {},
   },
};

export const PopupProviderContext = createContext<PopupProviderState>(initialState);

export function PopupProvider({ children, ...props }: { children: React.ReactNode }) {
   const [tab, setTab] = useState<PopupTab>(initialState.currentTab);
   const [view, setView] = useState<PopupView>(initialState.currentView);

   const [viewPropsCommand, setViewPropsCommand] = useState<PopupViewPropsCommand | undefined>(
      initialState.currentViewProps.command,
   );
   const [viewPropsUrls, setViewPropsUrls] = useState<string[]>(initialState.currentViewProps.urls ?? [""]);
   const [viewPropsScript, setViewPropsScript] = useState<string | undefined>(initialState.currentViewProps.script);
   const [viewPropsScriptDescription, setViewPropsScriptDescription] = useState<string | undefined>(
      initialState.currentViewProps.scriptDescription,
   );

   useEffect(() => {
      browser.storage.local.get([popupStorageKey]).then((values) => {
         const value: PopupStorage | undefined = values[popupStorageKey];

         if (value?.tab) setTab(value.tab);
         if (value?.view) setView(value.view);
         if (value?.viewProps) {
            setViewPropsCommand(value.viewProps.command);
            setViewPropsUrls(value.viewProps.urls ?? [""]);
            setViewPropsScript(value.viewProps.script);
            setViewPropsScriptDescription(value.viewProps.scriptDescription);
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
                     scriptDescription: viewPropsScriptDescription,
                  },
               },
            })
            .catch(console.error);
      };

      window.addEventListener("unload", unMountHandler);

      return () => {
         window.removeEventListener("unload", unMountHandler);
      };
   }, [tab, view, viewPropsCommand, viewPropsScript, viewPropsUrls, viewPropsScriptDescription]);

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
         else if (props?.scriptDescription) setViewPropsScriptDescription(props.scriptDescription);
         else {
            setViewPropsCommand(undefined);
            setViewPropsUrls([""]);
            setViewPropsScript(undefined);
            setViewPropsScriptDescription(undefined);
         }
      },

      currentViewProps: {
         command: viewPropsCommand,
         urls: viewPropsUrls,
         script: viewPropsScript,
         scriptDescription: viewPropsScriptDescription,
      },
      setCurrentViewProps: {
         command: setViewPropsCommand,
         urls: setViewPropsUrls,
         script: setViewPropsScript,
         scriptDescription: setViewPropsScriptDescription,
      },
   };

   return (
      <PopupProviderContext.Provider {...props} value={value}>
         {children}
      </PopupProviderContext.Provider>
   );
}
