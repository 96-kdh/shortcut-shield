import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import InputCommand, { popupCmdInputId } from "@/components/popup/input/Input.Command.tsx";
import InputUrl, { popupUrlInputClassName } from "@/components/popup/input/Input.Url.tsx";
import { Button } from "@/components/ui";
import { injectionMissingClassName } from "@/constant";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useCommandDoNothing, { isValidUrl } from "@/hooks/useCommand.DoNothing.ts";
import useValidationClass from "@/hooks/useValidationClass.ts";
import { ModifierKey } from "@/types";

const ViewDoNothingSetCommand: React.FC = () => {
   const { commands, updateCommand } = useCommandDoNothing();
   const { setCurrentView, currentViewProps } = usePopup();
   const { mark } = useValidationClass(injectionMissingClassName);

   // command [Ctrl + s] == [modifierKey + triggerKey]
   const [modifierKey, setModifierKey] = useState<ModifierKey | "">("");
   const [triggerKey, setTriggerKey] = useState<string>("");

   const [urls, setUrls] = useState<string[]>([""]);

   const submitHandler = async () => {
      const urlInputsElements = document.getElementsByClassName(
         popupUrlInputClassName,
      ) as HTMLCollectionOf<HTMLInputElement>;
      let isPassed = true;
      for (const el of urlInputsElements) {
         if (!el.value || isValidUrl(el.value)) continue;
         mark(el);
         isPassed = false;
      }

      if (!modifierKey || !triggerKey) {
         mark(document.getElementById(popupCmdInputId));
         isPassed = false;
      }

      if (!isPassed) {
         toast.warning("invalid values");
         return;
      }

      const cmd = `${modifierKey}+${triggerKey.trim().toUpperCase()}` as `${ModifierKey}+${string}`;
      await updateCommand(cmd, urls, commands.get(cmd)?.isActive ?? true);
      setCurrentView(PopupView.Index);
   };

   // useEffect(() => {
   //    console.log("currentViewProps: ", currentViewProps);
   //
   //    let array;
   //
   //    if (currentViewProps.command?.value) {
   //       const _savedRule = commands.get(currentViewProps.command.value);
   //       if (_savedRule?.urls) {
   //          array = Array.from(_savedRule.urls);
   //       }
   //    }
   //
   //    if (currentViewProps.urls) {
   //       if (array) array = array.concat(currentViewProps.urls);
   //       else array = currentViewProps.urls;
   //    }
   //
   //    if (array) setUrls(array);
   // }, [currentViewProps.command, currentViewProps.urls, commands]);

   return (
      <>
         <div className="space-y-4 flex-1 min-h-80 h-full overflow-y-scroll py-4 px-1">
            <InputCommand
               setModifierKey={setModifierKey}
               setTriggerKey={setTriggerKey}
               value={`${modifierKey}+${triggerKey}`}
            />
            <InputUrl urls={urls} setUrls={setUrls} />
         </div>

         <Button
            onClick={submitHandler}
            className="w-full py-3 bg-brandColor text-brandColor-foreground hover:bg-brandColor-600 font-bold cursor-pointer"
         >
            Save
         </Button>
      </>
   );
};

export default ViewDoNothingSetCommand;
