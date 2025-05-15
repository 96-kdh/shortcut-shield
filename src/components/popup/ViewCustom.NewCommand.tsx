import { javascript } from "@codemirror/lang-javascript";
import { EditorState, StateEffect } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, basicSetup } from "codemirror";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import browser from "webextension-polyfill";

import { useTheme } from "@/hooks/contexts/useTheme.ts";

const ViewCustomNewCommand: React.FC = () => {
   const { theme } = useTheme();
   console.log("load ViewCustomNewCommand");

   const ref = useRef<HTMLDivElement>(null);
   const [view, setView] = useState<EditorView>();
   const [isTS, setIsTS] = useState(false);
   const [isDark, setIsDark] = useState(false);

   useEffect(() => {
      if (!ref.current) return;

      const state = EditorState.create({
         doc: "// Your code…",
         extensions: [basicSetup, javascript({ typescript: isTS })],
      });

      const v = new EditorView({ state, parent: ref.current });
      setView(v);
      return () => v.destroy();
   }, []);

   // 언어/테마 토글 시 재구성
   const reconfigure = () => {
      if (!view) return;

      const extensions = [basicSetup, javascript({ typescript: isTS })];

      if (isDark) extensions.push(oneDark);

      view.dispatch({
         effects: StateEffect.reconfigure.of(extensions),
      });
   };

   return (
      <div>
         <div className="flex space-x-2 mb-2">
            <button
               onClick={() => {
                  setIsTS((f) => !f);
                  reconfigure();
               }}
            >
               {isTS ? "Switch to JS" : "Switch to TS"}
            </button>
            <button
               onClick={() => {
                  setIsDark((f) => !f);
                  reconfigure();
               }}
            >
               {isDark ? "Light Theme" : "Dark Theme"}
            </button>
            <button
               onClick={async () => {
                  if (!view) return;

                  const code = view.state.doc.toString();

                  try {
                     const res: { status: 200 | 400 | 500; exceptionDetails: { name: string; description: string } } =
                        await browser.runtime.sendMessage({
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
               }}
            >
               Run ▶
            </button>
         </div>
         <div ref={ref} className="h-64 border" />
      </div>
   );
};

export default ViewCustomNewCommand;
