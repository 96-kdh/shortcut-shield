import { CircleHelp } from "lucide-react";
import React, { useCallback, useEffect } from "react";

import { Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useCustomCommand from "@/hooks/useCommand.Custom.ts";
import useCommandDoNothing from "@/hooks/useCommand.DoNothing.ts";
import useValidationClass from "@/hooks/useValidationClass.ts";
import { detectModifierKey, detectTriggerKey } from "@/lib/utils.ts";

export const popupCmdInputId = "shortcutShieldPopupCommandInputId";

const InputCommand = () => {
   const { commands: doNothingCommands, formatDisplay } = useCommandDoNothing();
   const { commands: customCommands } = useCustomCommand();
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
            msg: "A command that is already in use.",
         });
         return;
      }

      // warn
      if (currentView === PopupView.DoNothingNewCommand && customRules) {
         mark.warning(document.getElementById(popupCmdInputId), {
            msg: "Commands that are already in use in Custom. \nIf the same Command is active in Custom, it will be ignored.",
         });
      } else if (currentView === PopupView.CustomNewCommand && doNothingRules) {
         mark.warning(document.getElementById(popupCmdInputId), {
            msg: "Command already in use by Do Nothing. \nIf that command is active, commands in Do Nothing will be ignored.",
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
                  <div className="space-y-1 text-sm">
                     <p>
                        <strong>Allowed modifier keys</strong>: Alt, Ctrl, Command (macOS) or Windows (Win)
                     </p>
                     <p>
                        <strong>Key selection</strong>: Any single alphanumeric character (A–Z, a–z, 0–9) or common
                        special symbols (e.g.{" "}
                        <code className="bg-sidebar-accent text-sidebar-accent-foreground px-1">
                           . , ↑ ← Insert, Delete ...
                        </code>
                        )
                     </p>
                     <p>
                        <strong>Syntax</strong>: Must be in the form <code>&lt;Modifier&gt;+&lt;Key&gt;</code> (e.g.
                        <code className="bg-sidebar-accent text-sidebar-accent-foreground px-1">Ctrl+S</code>,{" "}
                        <code className="bg-sidebar-accent text-sidebar-accent-foreground px-1">Ctrl+T</code>)
                     </p>
                     <p>
                        <strong>Important</strong>: Some browser- or OS-reserved shortcuts may not be intercepted at the
                        top level and therefore won’t be blocked by this extension. Please choose combinations that
                        aren’t already claimed by your browser.
                     </p>
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
