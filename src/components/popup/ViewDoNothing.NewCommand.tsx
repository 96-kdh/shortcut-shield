import { CircleHelp, Plus, Trash } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { injectionMissingClassName } from "@/constant";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useCommandDoNothing, { isValidUrl } from "@/hooks/useCommand.DoNothing.ts";
import useValidationClass from "@/hooks/useValidationClass.ts";
import { detectModifierKey, detectTriggerKey } from "@/lib/utils.ts";
import { type CommandType, ModifierKey } from "@/types";

const popupCmdInputId = "shortcutShieldPopupCommandInputId";
const popupUrlInputClassName = "shortcutShieldPopupUrlInputClassName";

const CommandInput = ({
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

const UrlInput = ({ urls, setUrls }: { urls: string[]; setUrls: React.Dispatch<React.SetStateAction<string[]>> }) => {
   const { clear } = useValidationClass(injectionMissingClassName);

   const handleUrlChange = (index: number, value: string) => {
      const next = [...urls];
      next[index] = value;
      setUrls(next);
   };

   const addUrl = () => {
      setUrls((prev) => [...prev, ""]);
   };

   const removeUrl = (index: number) => {
      if ([...urls].length <= 1) return;
      setUrls((prev) => prev.filter((_, i) => i !== index));
   };

   return (
      <div>
         <TooltipProvider>
            <Tooltip>
               <TooltipTrigger>
                  <label className="text-sm font-bold flex items-center justify-center gap-1">
                     URL <CircleHelp className="w-4 h-4 -mt-1" />
                  </label>
               </TooltipTrigger>
               <TooltipContent side="top" align="start" className="max-w-xs whitespace-normal break-words">
                  <div className="space-y-1 text-sm">
                     <p className="text-sm">
                        Please enter a fully qualified URL that begins with{" "}
                        <code className="bg-sidebar-accent text-sidebar-accent-foreground px-1">http://</code> or{" "}
                        <code className="bg-sidebar-accent text-sidebar-accent-foreground px-1">https://</code> and
                        includes a top-level domain (for example,{" "}
                        <code className="bg-sidebar-accent text-sidebar-accent-foreground px-1">
                           https://example.com
                        </code>
                        )
                     </p>
                  </div>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>

         {urls.map((url, idx) => (
            <div key={idx} className={`flex items-center space-x-2 ${idx !== 0 && "mt-2"}`}>
               <Input
                  onFocus={(e) => clear(e.target)}
                  placeholder="E.g. https://google.com"
                  value={url}
                  onChange={(e) => handleUrlChange(idx, e.target.value)}
                  className={`w-full max-w-96 bg-transparent border-0 shadow-lg ${popupUrlInputClassName}`}
               />
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrl(idx)}
                  disabled={urls.length === 1}
                  className={`${urls.length === 1 ? "text-gray-400" : "text-destructive"} disabled:opacity-50 cursor-pointer shadow-lg`}
               >
                  <Trash className="w-4 h-4" />
               </Button>
            </div>
         ))}

         {/* URL 추가 버튼 */}
         <Button
            onClick={addUrl}
            className="flex items-center justify-center px-2 bg-brandColor text-brandColor-foreground hover:bg-brandColor-600 font-bold mt-4 cursor-pointer"
         >
            <Plus className="w-4 h-4 mr-1" />
            Add URL
         </Button>
      </div>
   );
};

const ViewDoNothingNewCommand: React.FC = () => {
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

   useEffect(() => {
      if (!currentViewProps.command) return;

      const _savedRule = commands.get(currentViewProps.command);
      if (_savedRule?.urls) setUrls([...Array.from(_savedRule.urls), ""]);
   }, [currentViewProps, commands]);

   return (
      <>
         <div className="space-y-4 flex-1 min-h-80 h-full overflow-y-scroll py-4 px-1">
            <CommandInput
               setModifierKey={setModifierKey}
               setTriggerKey={setTriggerKey}
               value={`${modifierKey}+${triggerKey}`}
            />
            <UrlInput urls={urls} setUrls={setUrls} />
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

export default ViewDoNothingNewCommand;
