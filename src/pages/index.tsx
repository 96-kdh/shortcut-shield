import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import Header from "@/components/Header.tsx";
import ViewCustomSetCommand from "@/components/popup/View.Custom.SetCommand.tsx";
import ViewDoNothingSetCommand from "@/components/popup/View.DoNothing.SetCommand.tsx";
import ViewExtensionSetCommand from "@/components/popup/View.Extension.SetCommand.tsx";
import TabContentsCustom from "@/components/popup/tabs/TabContents.Custom.tsx";
import TabContentsDoNothing from "@/components/popup/tabs/TabContents.DoNothing.tsx";
import TabContentsExtension, { type RawExtensionRules } from "@/components/popup/tabs/TabContents.Extension.tsx";
import TabTrigger from "@/components/popup/tabs/TabTrigger.tsx";
import { SyncStorageKey } from "@/constant";
import { PopupTab, PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";

const Index: React.FC = () => {
   const { currentView, currentTab } = usePopup();

   // 추후 extension 기능이 늘어나면 저장형태에 맞춰서 context 관리
   const [rawExtensionRule, setRawExtensionRule] = useState<RawExtensionRules>({
      isActiveDelayEnter: false,
      delayTime: 500,
   });

   useEffect(() => {
      browser.storage.sync
         .get(SyncStorageKey.Extension)
         .then((res: { [SyncStorageKey.Extension]?: RawExtensionRules }) => {
            if (res[SyncStorageKey.Extension]) setRawExtensionRule(res[SyncStorageKey.Extension]);
         });
   }, []);

   return (
      <div className="h-full flex flex-col min-w-80 max-w-210 mx-auto bg-sidebar p-2">
         <Header />

         {currentView === PopupView.DoNothingNewCommand ? (
            <ViewDoNothingSetCommand />
         ) : currentView === PopupView.CustomNewCommand ? (
            <ViewCustomSetCommand />
         ) : currentView === PopupView.ExtensionNewCommand ? (
            <ViewExtensionSetCommand rawExtensionRule={rawExtensionRule} setRawExtensionRule={setRawExtensionRule} />
         ) : (
            <>
               <TabTrigger />
               {currentTab === PopupTab.DoNothing ? (
                  <TabContentsDoNothing />
               ) : currentTab === PopupTab.Custom ? (
                  <TabContentsCustom />
               ) : (
                  <TabContentsExtension rawExtensionRule={rawExtensionRule} setRawExtensionRule={setRawExtensionRule} />
               )}
            </>
         )}
      </div>
   );
};

export default Index;
