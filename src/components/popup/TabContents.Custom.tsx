import React from "react";

import { Button, Switch } from "@/components/ui";

const TabContentsCustom = () => {
   const commands = ["Turn off lights", "Play rain sounds"];

   return (
      <>
         <div className="space-y-4 flex-1 min-h-80 h-full overflow-y-scroll py-4">
            <div className="space-y-4">
               {commands.map((cmd) => (
                  <div key={cmd} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                     <div>
                        <p className="font-medium">{cmd}</p>
                        <p className="text-sm text-gray-500">When I say '{cmd.toLowerCase()}'</p>
                     </div>
                     <Switch />
                  </div>
               ))}
            </div>
         </div>
         <Button className="w-full py-3 bg-brandColor hover:bg-yellow-500 text-black font-bold cursor-pointer">
            Add New Command
         </Button>
      </>
   );
};

export default TabContentsCustom;
