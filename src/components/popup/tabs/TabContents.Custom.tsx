import { Settings } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import AlertDialogAskSure from "@/components/popup/alertDialog/AlertDialog.askSure.tsx";
import { Button, Input, Switch } from "@/components/ui";
import { PopupView } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import useCommandCustom from "@/hooks/useCommand.Custom.ts";

const TabContentsCustom = () => {
   const { commands, setActive, delCommand, formatDisplay } = useCommandCustom();
   const { setCurrentView, currentViewProps } = usePopup();

   return (
      <>
         <div className="space-y-4 flex-1 min-h-80 h-full overflow-y-scroll py-4">
            <div className="space-y-4">
               {Array.from(commands.entries()).map(([cmd, rule]) => (
                  <div
                     key={cmd}
                     className="flex items-center justify-between p-4 bg-gray-100 dark:bg-sidebar-accent rounded-lg shadow-md"
                  >
                     <div>
                        <Input
                           className="font-medium text-center max-w-24 cursor-default"
                           value={formatDisplay(cmd)}
                           readOnly
                        />
                        {rule.scriptDescription && (
                           <p className="text-sm text-muted-foreground mt-1 px-2">{rule.scriptDescription}</p>
                        )}
                     </div>

                     <div className="flex items-center justify-between gap-1">
                        <Switch
                           checked={rule.isActive}
                           className="cursor-pointer data-[state=checked]:bg-brandColor"
                           onClick={() => setActive(cmd, !rule.isActive)}
                        />

                        <div
                           className="p-1 cursor-pointer shadow:lg text-accent-foreground hover:text-brandColor"
                           onClick={() =>
                              setCurrentView(PopupView.CustomNewCommand, {
                                 ...currentViewProps,
                                 command: {
                                    value: cmd,
                                    type: "readOnly",
                                 },
                              })
                           }
                        >
                           <Settings className="w-4 h-4" />
                        </div>
                        <AlertDialogAskSure onClick={() => delCommand(cmd)} />
                     </div>
                  </div>
               ))}
            </div>
         </div>
         <Button
            onClick={() => setCurrentView(PopupView.CustomNewCommand)}
            className="w-full py-3 bg-brandColor hover:bg-yellow-500 text-black font-bold cursor-pointer"
         >
            Add New Custom Command
         </Button>
      </>
   );
};

export default TabContentsCustom;
