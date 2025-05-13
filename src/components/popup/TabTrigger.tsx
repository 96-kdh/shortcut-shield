import React from "react";

import { PopupTab } from "@/contexts/popup.provider.tsx";
import { usePopup } from "@/hooks/contexts/usePopup.ts";

const TabTrigger = () => {
   const { currentTap, setCurrentTap } = usePopup();

   return (
      <div className="flex flex-col relative">
         <div className="flex space-x-6">
            {Object.values(PopupTab).map((item, index) => (
               <button
                  key={index}
                  className={`pb-2 transition-colors duration-150 cursor-pointer z-1  font-bold
            ${currentTap === item ? "border-b-4 border-brandColor" : "opacity-45 hover:opacity-80"}
          `}
                  onClick={() => setCurrentTap(item)}
               >
                  {item}
               </button>
            ))}
         </div>
         <div className="absolute h-[1px] w-[calc(100%+1rem)] bg-sidebar-border left-[-0.5rem] bottom-0 z-0"></div>
      </div>
   );
};

export default TabTrigger;
