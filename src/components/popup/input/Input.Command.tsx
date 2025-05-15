import { CircleHelp } from "lucide-react";
import React, { useCallback, useEffect } from "react";

import { Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { injectionMissingClassName } from "@/constant";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useCommandDoNothing from "@/hooks/useCommand.DoNothing.ts";
import useValidationClass from "@/hooks/useValidationClass.ts";
import { detectModifierKey, detectTriggerKey } from "@/lib/utils.ts";
import { type CommandType, ModifierKey } from "@/types";

export const popupCmdInputId = "shortcutShieldPopupCommandInputId";

const InputCommand = ({
   setModifierKey,
   setTriggerKey,
   value,
}: {
   setModifierKey: React.Dispatch<React.SetStateAction<ModifierKey | "">>;
   setTriggerKey: React.Dispatch<React.SetStateAction<string>>;
   value: CommandType;
}) => {
   const { commands, formatDisplay } = useCommandDoNothing();
   const { currentViewProps } = usePopup();
   const { mark, clear } = useValidationClass(injectionMissingClassName);

   const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      const modKey = detectModifierKey(e);
      const trigKey = detectTriggerKey(e);

      if (!modKey || !trigKey) {
         setModifierKey("");
         setTriggerKey("");
         return;
      }

      setModifierKey(modKey);
      setTriggerKey(trigKey);

      clear(e.currentTarget);
   }, []);

   useEffect(() => {
      if (!currentViewProps.command) return;

      const [_modifierKey, _triggerKey] = currentViewProps.command.split("+") as [ModifierKey, string];
      setModifierKey(_modifierKey);
      setTriggerKey(_triggerKey);
   }, [currentViewProps.command]);

   useEffect(() => {
      if (!currentViewProps.command) {
         const rules = commands.get(value);
         if (rules) {
            setModifierKey("");
            setTriggerKey("");
            mark(document.getElementById(popupCmdInputId), {
               msg: "A command that is already in use.",
            });
         }
      }
   }, [currentViewProps.command, commands, value]);

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
            value={formatDisplay(value)}
            readOnly
            onKeyDown={(event) => {
               event.preventDefault(); // 기본 커서 이동 등 동작 차단
               event.stopPropagation();

               if (!currentViewProps.command) handleKeyDown(event);
            }}
            className={`w-full max-w-28 bg-transparent border-0 text-center shadow-lg ${currentViewProps.command && "bg-gray-200 cursor-default"}`}
         />
      </div>
   );
};

export default InputCommand;
