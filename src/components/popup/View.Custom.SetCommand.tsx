import { EditorView } from "codemirror";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import InputAgreeCheckBox, {
   popupAgreeCheckboxInputClassName,
} from "@/components/popup/input/Input.Agree.CheckBox.tsx";
import InputCommand, { popupCmdInputId } from "@/components/popup/input/Input.Command.tsx";
import InputScript, { getDiagnostics } from "@/components/popup/input/Input.Script.tsx";
import InputUrl, { popupUrlInputClassName } from "@/components/popup/input/Input.Url.tsx";
import { Button } from "@/components/ui";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useCustomCommand from "@/hooks/useCommand.Custom.ts";
import { isValidUrl } from "@/hooks/useCommand.DoNothing.ts";
import useValidationClass from "@/hooks/useValidationClass.ts";

const ViewCustomSetCommand: React.FC = () => {
   const { commands, updateCommand } = useCustomCommand();
   const { setCurrentView, currentViewProps, setCurrentViewProps } = usePopup();
   const { mark } = useValidationClass();

   const hasMergedOnce = useRef(false);
   const [view, setView] = useState<EditorView>();

   const checkScript = () => {
      if (!view) return [];

      const code = view.state.doc.toString();
      return getDiagnostics(code);
   };

   const submitHandler = async () => {
      let isPassed = true;

      const urlInputsElements = document.getElementsByClassName(
         popupUrlInputClassName,
      ) as HTMLCollectionOf<HTMLInputElement>;
      for (const el of urlInputsElements) {
         if (!el.value || isValidUrl(el.value)) continue;
         mark.error(el, {
            msg: "Please enter a fully qualified URL that begins with http:// or https:// and includes a top-level domain.",
            parentPosition: "afterend",
         });
         isPassed = false;
      }

      const checkboxElements = document.getElementsByClassName(
         popupAgreeCheckboxInputClassName,
      ) as HTMLCollectionOf<HTMLButtonElement>;
      for (const el of checkboxElements) {
         if (el.dataset.state === "checked") continue;
         mark.error(el, {
            msg: "You must agree to this.",
            parentPosition: "beforebegin",
         });
         isPassed = false;
      }

      if (!currentViewProps.command?.value) {
         mark.error(document.getElementById(popupCmdInputId), {
            msg: "Does not accept null values.",
         });
         isPassed = false;
      }

      if (!isPassed) {
         toast.warning("There are invalid values to submit.");
         return;
      }

      const cmd = currentViewProps.command!.value;
      await updateCommand(
         cmd,
         currentViewProps.urls,
         commands.get(cmd)?.isActive ?? true,
         view?.state.doc.toString() ?? "",
         currentViewProps.scriptDescription,
      );
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
            <InputScript view={view} setView={setView} checkScript={checkScript} />
            <InputAgreeCheckBox />
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

export default ViewCustomSetCommand;
