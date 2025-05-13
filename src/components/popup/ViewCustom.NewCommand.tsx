import { X } from "lucide-react";
import React from "react";

import { Button, Textarea } from "@/components/ui";

const ViewCustomNewCommand: React.FC = () => {
   return (
      <div className="max-w-md mx-auto p-6 space-y-8 bg-white rounded-lg shadow">
         <header className="flex items-center justify-between">
            <button aria-label="Close">
               <X className="w-6 h-6 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold">New Web Command</h1>
            <div className="w-6" /> {/* Placeholder for centering */}
         </header>

         <div className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700">Command</label>
               <Textarea placeholder="Type '/' to start" className="mt-1 h-12" />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700">URL</label>
               <Textarea placeholder="https://www.google.com" className="mt-1 h-24" />
            </div>
         </div>

         <Button className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium">Add Command</Button>
      </div>
   );
};
export default ViewCustomNewCommand;
