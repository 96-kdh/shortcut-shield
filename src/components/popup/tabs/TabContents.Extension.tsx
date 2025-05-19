import { Settings } from "lucide-react";
import React, { useCallback } from "react";
import { Trans } from "react-i18next";
import browser from "webextension-polyfill";

import { Input, Switch } from "@/components/ui";
import { SyncStorageKey } from "@/constant";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";

export type RawExtensionRules = {
   isActiveDelayEnter: boolean;
   delayTime: number;
};

const TabContentsExtension = ({
   rawExtensionRule,
   setRawExtensionRule,
}: {
   rawExtensionRule: RawExtensionRules;
   setRawExtensionRule: React.Dispatch<React.SetStateAction<RawExtensionRules>>;
}) => {
   const { setCurrentView } = usePopup();

   const activeHandler = useCallback(async () => {
      await browser.storage.sync.set({
         [SyncStorageKey.Extension]: {
            ...rawExtensionRule,
            isActiveDelayEnter: !rawExtensionRule.isActiveDelayEnter,
         },
      });

      setRawExtensionRule({
         ...rawExtensionRule,
         isActiveDelayEnter: !rawExtensionRule.isActiveDelayEnter,
      });
   }, [rawExtensionRule]);

   return (
      <div className="space-y-4 flex-1 min-h-80 h-full overflow-y-scroll py-4">
         <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-sidebar-accent rounded-lg shadow-md">
               <div>
                  <Input className="font-medium text-center max-w-24 cursor-default" value={"Enter"} readOnly />
                  <p className="text-sm text-muted-foreground mt-1 px-2">
                     <Trans
                        i18nKey="delayEnterDescription"
                        components={[<code key="0" className="font-bold text-sidebar-accent-foreground" />]}
                        values={{ delayTime: rawExtensionRule.delayTime }}
                     />
                  </p>
               </div>

               <div className="flex items-center justify-between gap-1">
                  <Switch
                     checked={rawExtensionRule.isActiveDelayEnter}
                     className="cursor-pointer data-[state=checked]:bg-brandColor"
                     onClick={activeHandler}
                  />
                  <div
                     className="p-1 cursor-pointer shadow:lg text-accent-foreground hover:text-brandColor"
                     onClick={() => setCurrentView(PopupView.ExtensionNewCommand)}
                  >
                     <Settings className="w-4 h-4" />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default TabContentsExtension;
