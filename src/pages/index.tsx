import React from "react";

import Header from "@/components/Header.tsx";
import ViewCustomSetCommand from "@/components/popup/View.Custom.SetCommand.tsx";
import ViewDoNothingSetCommand from "@/components/popup/View.DoNothing.SetCommand.tsx";
import TapContentsCustom from "@/components/popup/tabs/TabContents.Custom.tsx";
import TabContentsDoNothing from "@/components/popup/tabs/TabContents.DoNothing.tsx";
import TabTrigger from "@/components/popup/tabs/TabTrigger.tsx";
import { PopupTab, PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";

const Index: React.FC = () => {
   const { currentView, currentTap } = usePopup();

   return (
      <div className="h-full flex flex-col min-w-80 max-w-210 mx-auto bg-sidebar p-2">
         <Header />

         {currentView === PopupView.DoNothingNewCommand ? (
            <ViewDoNothingSetCommand />
         ) : currentView === PopupView.CustomNewCommand ? (
            <ViewCustomSetCommand />
         ) : (
            <>
               <TabTrigger />
               {currentTap === PopupTab.DoNothing ? <TabContentsDoNothing /> : <TapContentsCustom />}
            </>
         )}
      </div>
   );
};

export default Index;
