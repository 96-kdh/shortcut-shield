import React from "react";
import { useTranslation } from "react-i18next";
import browser from "webextension-polyfill";

import type { RawExtensionRules } from "@/components/popup/tabs/TabContents.Extension.tsx";
import { Button, Input } from "@/components/ui";
import { SyncStorageKey } from "@/constant";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";

const ViewExtensionSetCommand = ({
   rawExtensionRule,
   setRawExtensionRule,
}: {
   rawExtensionRule: RawExtensionRules;
   setRawExtensionRule: React.Dispatch<React.SetStateAction<RawExtensionRules>>;
}) => {
   const { t } = useTranslation();
   const { setCurrentView } = usePopup();

   const [delayTime, setDelayTime] = React.useState<number>(rawExtensionRule.delayTime);

   const submitHandler = async () => {
      await browser.storage.sync.set({
         [SyncStorageKey.Extension]: {
            ...rawExtensionRule,
            delayTime,
         },
      });

      setRawExtensionRule({
         ...rawExtensionRule,
         delayTime,
      });
      setCurrentView(PopupView.Index);
   };

   return (
      <>
         <div className="space-y-4 flex-1 min-h-80 h-full overflow-y-scroll py-4 px-1">
            <div>
               <label className="text-sm font-bold gap-1">Command</label>
               <Input
                  value={"Enter"}
                  readOnly
                  className={`w-full max-w-28 bg-transparent border-0 text-center shadow-lg bg-gray-200 cursor-default border-2`}
               />
            </div>
            <label className="text-sm font-bold gap-1">Delay Time</label>
            <div className="flex items-end-safe gap-0.5">
               <Input
                  type="number"
                  className="w-full max-w-28 bg-transparent border-0 text-center shadow-lg"
                  defaultValue={delayTime}
                  value={delayTime}
                  onChange={(e) => setDelayTime(Number(e.target.value))}
               />
               <span className="text-sm text-muted-foreground">(milli second)</span>
            </div>
         </div>

         <Button
            onClick={submitHandler}
            className="w-full py-3 bg-brandColor text-brandColor-foreground hover:bg-brandColor-600 font-bold cursor-pointer"
         >
            {t("save")}
         </Button>
      </>
   );
};

export default ViewExtensionSetCommand;
