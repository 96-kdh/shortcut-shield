import { Trash } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui";

const AlertDialogAskSure = ({ onClick }: { onClick: () => void }) => {
   const { t } = useTranslation();

   return (
      <AlertDialog>
         <AlertDialogTrigger>
            <div className="p-1 cursor-pointer shadow:lg text-accent-foreground hover:text-brandColor">
               <Trash className="w-4 h-4" />
            </div>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>{t("askSure")}</AlertDialogTitle>
               <AlertDialogDescription>{t("askSureDesc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel className="cursor-pointer">{t("cancel")}</AlertDialogCancel>
               <AlertDialogAction className="cur4sor-pointer" onClick={onClick}>
                  {t("confirm")}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

export default AlertDialogAskSure;
