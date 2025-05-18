import React from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/components/ui";
import useValidationClass from "@/hooks/useValidationClass.ts";

export const popupAgreeCheckboxInputClassName = "shortcutShieldPopupAgreeCheckboxInputClassName";

const InputAgreeCheckBox = () => {
   const { t } = useTranslation();
   const { clear } = useValidationClass();

   const terms = [
      {
         id: "terms1",
         title: t("term1Title"),
         description: t("term1Description"),
      },
      {
         id: "terms2",
         title: t("term2Title"),
         description: t("term2Description"),
      },
      {
         id: "terms3",
         title: t("term3Title"),
         description: t("term3Description"),
      },
   ];

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
