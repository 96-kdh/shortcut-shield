import React, { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import browser from "webextension-polyfill";

import { Input, Switch } from "@/components/ui";
import { SyncStorageKey } from "@/constant";

// type ExtensionRuleOf<UrlsType> = {
//    urls: UrlsType;
//    isActive: boolean;
//    scriptDescription?: string;
// };
// // export type ExtensionRule = ExtensionRuleOf<Set<string> | "*">;
// export type ExtensionRule = ExtensionRuleOf<"*">;
// export type ExtensionRules = Map<string, ExtensionRule>;
//
// export const initialExtensionRules: ExtensionRules = new Map().set("Enter", {
//    urls: "*",
//    isActive: false,
//    scriptDescription: "...scriptDescription",
// });

export type RawExtensionRules = {
   isActiveDelayEnter: boolean;
};

const TabContentsExtension = () => {
   const { t } = useTranslation();

   const [rawExtensionRule, setRawExtensionRule] = useState<RawExtensionRules>({
      isActiveDelayEnter: false,
   });

   const activeHandler = useCallback(async () => {
      await browser.storage.sync.set({
         [SyncStorageKey.Extension]: {
            isActiveDelayEnter: !rawExtensionRule.isActiveDelayEnter,
         },
      });

      setRawExtensionRule({
         ...rawExtensionRule,
         isActiveDelayEnter: !rawExtensionRule.isActiveDelayEnter,
      });
   }, [rawExtensionRule.isActiveDelayEnter]);

   useEffect(() => {
      browser.storage.sync
         .get(SyncStorageKey.Extension)
         .then((res: { [SyncStorageKey.Extension]?: RawExtensionRules }) => {
            if (res[SyncStorageKey.Extension]?.isActiveDelayEnter) {
               setRawExtensionRule(res[SyncStorageKey.Extension]);
            }
         });
   }, []);

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
                     />
                  </p>
               </div>

               <div className="flex items-center justify-between gap-1">
                  <Switch
                     checked={rawExtensionRule.isActiveDelayEnter}
                     className="cursor-pointer data-[state=checked]:bg-brandColor"
                     onClick={activeHandler}
                  />
               </div>
            </div>
         </div>
      </div>
   );
};

export default TabContentsExtension;
