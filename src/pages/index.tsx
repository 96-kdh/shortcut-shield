import React from "react";

import Header from "@/components/Header.tsx";
import TapContentsCustom from "@/components/popup/TabContents.Custom.tsx";
import TabContentsDoNothing from "@/components/popup/TabContents.DoNothing.tsx";
import TabTrigger from "@/components/popup/TabTrigger.tsx";
import ViewCustomNewCommand from "@/components/popup/ViewCustom.NewCommand.tsx";
import ViewDoNothingNewCommand from "@/components/popup/ViewDoNothing.NewCommand.tsx";
import { PopupTab, PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";

const Index: React.FC = () => {
   const { currentView, currentTap } = usePopup();

   return (
      <div className="h-full flex flex-col min-w-80 max-w-210 mx-auto bg-sidebar p-2">
         <Header />

         {currentView === PopupView.DoNothingNewCommand ? (
            <ViewDoNothingNewCommand />
         ) : currentView === PopupView.CustomNewCommand ? (
            <ViewCustomNewCommand />
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
