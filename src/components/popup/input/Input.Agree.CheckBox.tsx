import React from "react";

import { Checkbox } from "@/components/ui";
import useValidationClass from "@/hooks/useValidationClass.ts";

const terms = [
   {
      id: "terms1",
      title: "I Wrote This Code Myself",
      description:
         "I confirm that this script is entirely my own work, was not copied from anyone else, and that I fully understand what it does.",
   },
   {
      id: "terms2",
      title: "I’ve Checked for Malicious Content",
      description:
         "I have reviewed the code and verified that it contains no malicious functions or hidden payloads. (If I lack the expertise to audit it myself, I will consult an AI tool or security professional before running it.)",
   },
   {
      id: "terms3",
      title: "I Accept All Risks & Liability",
      description:
         "I understand the potential security and stability risks of running this code, and I accept full responsibility for any consequences.",
   },
];

export const popupAgreeCheckboxInputClassName = "shortcutShieldPopupAgreeCheckboxInputClassName";

const InputAgreeCheckBox = () => {
   const { clear } = useValidationClass();
   return (
      <div className="mt-2">
         {terms.map((term) => (
            <div className="items-top flex space-x-2 mb-2" key={term.id}>
               <Checkbox
                  id={term.id}
                  className={`${popupAgreeCheckboxInputClassName} cursor-pointer data-[state=checked]:bg-brandColor dark:data-[state=checked]:bg-brandColor border-brandColor data-[state=checked]:border-brandColor dark:data-[state=checked]:border-brandColor`}
                  onFocus={(e) => clear(e.target)}
               />
               <div className="grid gap-1.5 leading-none">
                  <label
                     htmlFor={term.id}
                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                     {term.title}
                  </label>
                  <p className="text-sm text-muted-foreground">{term.description}</p>
               </div>
            </div>
         ))}
      </div>
   );
};

export default InputAgreeCheckBox;
