import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import InputCommand, { popupCmdInputId } from "@/components/popup/input/Input.Command.tsx";
import InputUrl, { popupUrlInputClassName } from "@/components/popup/input/Input.Url.tsx";
import { Button } from "@/components/ui";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useCommandDoNothing from "@/hooks/useCommand.DoNothing.ts";
import useValidationClass from "@/hooks/useValidationClass.ts";
import { isValidUrl } from "@/lib/utils.ts";

const ViewDoNothingSetCommand: React.FC = () => {
   const { t } = useTranslation();
   const { commands, updateCommand } = useCommandDoNothing();
   const { setCurrentView, currentViewProps, setCurrentViewProps } = usePopup();
   const { mark } = useValidationClass();

   const hasMergedOnce = useRef(false);

   const submitHandler = async () => {
      let isPassed = true;

      const urlInputsElements = document.getElementsByClassName(
         popupUrlInputClassName,
      ) as HTMLCollectionOf<HTMLInputElement>;
      for (const el of urlInputsElements) {
         if (!el.value || isValidUrl(el.value)) continue;
         mark.error(el, {
            msg: t("fullQualifiedUrl"),
            parentPosition: "afterend",
         });
         isPassed = false;
      }

      if (!currentViewProps.command?.value) {
         mark.error(document.getElementById(popupCmdInputId), {
            msg: t("doesNotAcceptNull"),
         });
         isPassed = false;
      }

      if (!isPassed) {
         toast.warning(t("invalidValues"));
         return;
      }

      const cmd = currentViewProps.command!.value;
      await updateCommand(cmd, currentViewProps.urls, commands.get(cmd)?.isActive ?? true);
      setCurrentView(PopupView.Index);
   };

   useEffect(() => {
      if (hasMergedOnce.current) return;

      if (currentViewProps.command?.value && currentViewProps.command.type === "readOnly") {
         const _savedRule = commands.get(currentViewProps.command.value);
         if (_savedRule?.urls) {
            const mergedUrls = Array.from(new Set([...Array.from(_savedRule.urls), ...currentViewProps.urls]));
            if (mergedUrls.length !== currentViewProps.urls.length) {
               setCurrentViewProps.urls(mergedUrls);
               hasMergedOnce.current = true;
            }
         }
      }
   }, [currentViewProps.command, currentViewProps.urls, commands]);

   return (
      <>
         <div className="space-y-4 flex-1 min-h-80 h-full overflow-y-scroll py-4 px-1">
            <InputCommand />
            <InputUrl />
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

export default ViewDoNothingSetCommand;
