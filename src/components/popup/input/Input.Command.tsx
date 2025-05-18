import { CircleHelp } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useCommandCustom from "@/hooks/useCommand.Custom.ts";
import useCommandDoNothing from "@/hooks/useCommand.DoNothing.ts";
import useValidationClass from "@/hooks/useValidationClass.ts";
import { detectModifierKey, detectTriggerKey } from "@/lib/utils.ts";

export const popupCmdInputId = "shortcutShieldPopupCommandInputId";

const InputCommand = () => {
   const { t } = useTranslation();
   const { commands: doNothingCommands, formatDisplay } = useCommandDoNothing();
   const { commands: customCommands } = useCommandCustom();
   const { setCurrentViewProps, currentViewProps, currentView } = usePopup();
   const { clear, mark } = useValidationClass();

   const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      const modKey = detectModifierKey(e);
      const trigKey = detectTriggerKey(e);

      if (!modKey || !trigKey) {
         return;
      }

      clear(e.currentTarget);
      setCurrentViewProps.command({ value: `${modKey}+${trigKey}`, type: "writable" });
   }, []);

   useEffect(() => {
      if (currentViewProps.command?.type === "readOnly") return;
      if (!currentViewProps.command?.value) return;

      const doNothingRules = doNothingCommands.get(currentViewProps.command.value);
      const customRules = customCommands.get(currentViewProps.command.value);

      // error
      if (
         (currentView === PopupView.DoNothingNewCommand && doNothingRules) ||
         (currentView === PopupView.CustomNewCommand && customRules)
      ) {
         setCurrentViewProps.command(undefined);
         mark.error(document.getElementById(popupCmdInputId), {
            msg: t("alreadyUsed"),
         });
         return;
      }

      // warn
      if (currentView === PopupView.DoNothingNewCommand && customRules) {
         mark.warning(document.getElementById(popupCmdInputId), {
            msg: t("alreadyUsedInCustom"),
         });
      } else if (currentView === PopupView.CustomNewCommand && doNothingRules) {
         mark.warning(document.getElementById(popupCmdInputId), {
            msg: t("alreadyUsedInDoNothing"),
         });
      }
   }, [currentViewProps.command, currentView, customCommands, doNothingCommands]);

   return (
      <div>
         <TooltipProvider>
            <Tooltip>
               <TooltipTrigger>
                  <label className="text-sm font-bold flex items-center justify-center gap-1">
                     Command <CircleHelp className="w-4 h-4 -mt-1" />
                  </label>
               </TooltipTrigger>
               <TooltipContent side="top" align="start" className="max-w-xs whitespace-normal break-words">
                  <div className="space-y-2 text-sm">
                     <Trans i18nKey="tooltipCommandModifier" components={[<strong key="0" />]} />
                     <Trans
                        i18nKey="tooltipCommandSelection"
                        components={[
                           <strong key="0" />,
                           <code key="1" className="bg-sidebar-accent text-sidebar-accent-foreground px-1" />,
                        ]}
                     />
                     <Trans
                        i18nKey="tooltipCommandSyntax"
                        components={[
                           <strong key="0" />,
                           <code key="1" className="bg-sidebar-accent text-sidebar-accent-foreground px-1" />,
                           <code key="2" className="bg-sidebar-accent text-sidebar-accent-foreground px-1" />,
                        ]}
                     />
                     <Trans i18nKey="tooltipCommandImportant" components={[<strong key="0" />]} />
                  </div>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>

         <Input
            id={popupCmdInputId}
            onFocus={(e) => clear(e.target)}
            placeholder="E.g. Ctrl + S"
            value={formatDisplay(currentViewProps.command?.value || "")}
            readOnly
            onKeyDown={(event) => {
               event.preventDefault(); // 기본 커서 이동 등 동작 차단
               event.stopPropagation();

               if (!currentViewProps.command?.value || currentViewProps.command.type === "writable") {
                  handleKeyDown(event);
               }
            }}
            className={`w-full max-w-28 bg-transparent border-0 text-center shadow-lg ${currentViewProps.command?.type === "readOnly" && "bg-gray-200 cursor-default border-2"}`}
         />
      </div>
   );
};

export default InputCommand;
