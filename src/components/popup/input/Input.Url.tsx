import { CircleHelp, Plus, Trash } from "lucide-react";
import React from "react";

import { Button, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useValidationClass from "@/hooks/useValidationClass.ts";

export const popupUrlInputClassName = "shortcutShieldPopupUrlInputClassName";

const InputUrl = () => {
   const { setCurrentViewProps, currentViewProps } = usePopup();
   const { clear } = useValidationClass();

   const handleUrlChange = (index: number, value: string) => {
      const next = [...currentViewProps.urls];
      next[index] = value;
      setCurrentViewProps.urls(next);
   };

   const addUrl = () => {
      setCurrentViewProps.urls([...currentViewProps.urls, ""]);
   };

   const removeUrl = (index: number) => {
      if (currentViewProps.urls.length <= 1) return;
      setCurrentViewProps.urls(currentViewProps.urls.filter((_, i) => i !== index));
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

         {currentViewProps.urls.map((url, idx) => (
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
                  disabled={currentViewProps.urls.length === 1}
                  className={`${currentViewProps.urls.length === 1 ? "text-gray-400" : "text-destructive"} disabled:opacity-50 cursor-pointer shadow-lg`}
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

export default InputUrl;
