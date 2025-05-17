import React, { useCallback, useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { Input, Switch } from "@/components/ui";

const TabContentsExtension = () => {
   const [isActiveDelayEnter, setIsActiveDelayEnter] = useState<boolean>(false);

   const activeHandler = useCallback(async () => {
      await browser.storage.sync.set({ isActiveDelayEnter: !isActiveDelayEnter });
      setIsActiveDelayEnter(!isActiveDelayEnter);
   }, [isActiveDelayEnter]);

   useEffect(() => {
      browser.storage.sync.get("isActiveDelayEnter").then((res: { isActiveDelayEnter?: boolean }) => {
         if (res.isActiveDelayEnter) setIsActiveDelayEnter(res.isActiveDelayEnter);
      });
   }, []);

   return (
      <div className="space-y-4 flex-1 min-h-80 h-full overflow-y-scroll py-4">
         <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-sidebar-accent rounded-lg shadow-md">
               <div>
                  <Input className="font-medium text-center max-w-24 cursor-default" value={"Enter"} readOnly />
                  <p className="text-sm text-muted-foreground mt-1 px-2">
                     When you press Enter, it checks how much time has passed since the last keystroke.
                     <br />
                     <br />
                     <code className="font-bold text-sidebar-accent-foreground">
                        If it's less than 500 milliseconds, the Enter event is blocked.
                     </code>
                     <br />
                     If more than 500 milliseconds have passed, the event is allowed to proceed normally.
                     <br />
                     <br />
                     This way, accidental fast presses are ignored, but intentional submissions after a pause still work
                     fine.
                     <br />
                     <br />
                     <code className="bg-sidebar-accent text-sidebar-accent-foreground">
                        Applies to all possible URLs.
                     </code>
                  </p>
               </div>

               <div className="flex items-center justify-between gap-1">
                  <Switch
                     checked={isActiveDelayEnter}
                     className="cursor-pointer data-[state=checked]:bg-brandColor"
                     onClick={activeHandler}
                  />
               </div>
            </div>
         </div>
      </div>
   );
};

export default TabContentsExtension;
