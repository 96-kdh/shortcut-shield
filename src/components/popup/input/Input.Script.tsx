import { javascript } from "@codemirror/lang-javascript";
import { EditorState, StateEffect } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, basicSetup } from "codemirror";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import browser from "webextension-polyfill";

import { Button } from "@/components/ui";
import { useTheme } from "@/hooks/contexts/useTheme.ts";

const basicExtension = [basicSetup, javascript()];

const InputScript = ({
   view,
   setView,
}: {
   view: EditorView | undefined;
   setView: React.Dispatch<React.SetStateAction<EditorView | undefined>>;
}) => {
   const { theme } = useTheme();
   const ref = useRef<HTMLDivElement>(null);

   const runScript = async () => {
      if (!view) return;

      const code = view.state.doc.toString();
      console.log(code);

      try {
         const res: {
            status: 200 | 400 | 500;
            exceptionDetails: { name: string; description: string };
         } = await browser.runtime.sendMessage({
            type: "DEBUG_RUN",
            code,
         });
         console.log(res);

         if (res.status !== 200) {
            toast.warning(res.exceptionDetails.description);
         }
      } catch (err) {
         console.log("Error running code:", err);
      }
   };

   useEffect(() => {
      if (!ref.current) return;

      const state = EditorState.create({
         doc: "// Your code…",
         extensions: basicExtension,
      });

      const v = new EditorView({ state, parent: ref.current });
      setView(v);

      return () => v.destroy();
   }, []);

   useEffect(() => {
      if (!ref.current || !view) return;

      let viewTheme: "light" | "dark";

      if (theme !== "system") viewTheme = theme;
      else viewTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

      if (viewTheme === "light") view.dispatch({ effects: StateEffect.reconfigure.of(basicExtension) });
      else view.dispatch({ effects: StateEffect.reconfigure.of([...basicExtension, oneDark]) });
   }, [theme, view]);

   return (
      <div>
         <div className="flex space-x-2 justify-end">
            <Button
               className="h-auto rounded-none px-[8px] py-[2px] bg-brandColor text-brandColor-foreground hover:bg-brandColor-600 font-bold cursor-pointer"
               onClick={runScript}
            >
               Run ▶
            </Button>
         </div>
         <div ref={ref} className="h-64 border" />
      </div>
   );
};

export default InputScript;
