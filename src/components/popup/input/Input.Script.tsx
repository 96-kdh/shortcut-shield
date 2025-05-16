import { javascript } from "@codemirror/lang-javascript";
import { type Diagnostic, lintGutter, linter } from "@codemirror/lint";
import { EditorState, StateEffect } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { parse } from "acorn";
import { EditorView, basicSetup } from "codemirror";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import * as ts from "typescript";

import { Button } from "@/components/ui";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import { useTheme } from "@/hooks/contexts/useTheme.ts";

// 1) getDiagnostics: TS LanguageService → CM Diagnostic[]
export function getDiagnostics(code: string): Diagnostic[] {
   const fileName = "file.js";
   const options: ts.CompilerOptions = {
      allowJs: true,
      checkJs: true,
      noEmit: true,
      strict: true,
      target: ts.ScriptTarget.ESNext,
   };

   const libSource = `
    declare namespace console {
      function log(...args: any[]): void;
      function warn(...args: any[]): void;
      function error(...args: any[]): void;
    }
  `;
   const libFileName = ts.getDefaultLibFileName(options);

   const host: ts.LanguageServiceHost = {
      getScriptFileNames: () => [fileName, libFileName],
      getScriptVersion: () => "0",
      getScriptSnapshot: (name) => {
         if (name === fileName) return ts.ScriptSnapshot.fromString(code);
         if (name === libFileName) return ts.ScriptSnapshot.fromString(libSource);
         return undefined;
      },
      getCurrentDirectory: () => "",
      getCompilationSettings: () => options,
      getDefaultLibFileName: () => libFileName,
   };

   const service = ts.createLanguageService(host);
   const syntactic = service.getSyntacticDiagnostics(fileName);
   const semantic = service.getSemanticDiagnostics(fileName);

   return [...syntactic, ...semantic].map((d) => {
      const start = d.start ?? 0;
      const length = d.length ?? 1;
      const message = typeof d.messageText === "string" ? d.messageText : d.messageText.messageText;
      return { from: start, to: start + length, severity: "error", message };
   });
}

// 2) 기존 JS 파싱 에러
const jsLinter =
   () =>
   (view: EditorView): Diagnostic[] => {
      const code = view.state.doc.toString();
      try {
         parse(code, { ecmaVersion: "latest", sourceType: "script" });
         return [];
      } catch (err: any) {
         const { loc, message } = err;
         if (loc) {
            const line = view.state.doc.line(loc.line);
            const from = line.from + loc.column;
            const to = from + 1;
            return [{ from, to, severity: "error", message }];
         }
         return [{ from: 0, to: code.length, severity: "error", message }];
      }
   };

// 3) Combined linter: JS syntax + TS semantic
const combinedLinter =
   () =>
   (view: EditorView): Diagnostic[] => {
      const jsErrors = jsLinter()(view);
      const tsErrors = getDiagnostics(view.state.doc.toString());
      return [...jsErrors, ...tsErrors];
   };

// 4) 에디터 확장: combined linter + gutter
const basicExtension = [basicSetup, javascript({ typescript: true }), linter(combinedLinter()), lintGutter()];

const InputScript = ({
   view,
   setView,
}: {
   view: EditorView | undefined;
   setView: React.Dispatch<React.SetStateAction<EditorView | undefined>>;
}) => {
   const { currentViewProps, setCurrentViewProps } = usePopup();
   const { theme } = useTheme();
   const ref = useRef<HTMLDivElement>(null);

   const runScript = async () => {
      if (!view) return;
      const code = view.state.doc.toString();
      const errors = getDiagnostics(code);
      console.log("TS Diagnostics:", errors);
   };

   // doc이 바뀌었을 때 실행할 코드
   const onDocChange = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
         const newCode = update.state.doc.toString();
         setCurrentViewProps({ script: newCode });
      }
   });

   useEffect(() => {
      if (!ref.current) return;

      const state = EditorState.create({
         doc: "// Your code… \n\n\n",
         extensions: [...basicExtension, onDocChange],
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

      if (viewTheme === "light")
         view.dispatch({ effects: StateEffect.reconfigure.of([...basicExtension, onDocChange]) });
      else view.dispatch({ effects: StateEffect.reconfigure.of([...basicExtension, onDocChange, oneDark]) });
   }, [theme, view]);

   return (
      <div>
         <div className="flex space-x-2 justify-end">
            <Button
               className="h-auto rounded-none px-[8px] py-[2px] bg-brandColor text-brandColor-foreground hover:bg-brandColor-600 font-bold cursor-pointer"
               onClick={runScript}
            >
               Check Code ▶
            </Button>
         </div>
         <div ref={ref} className="min-h-64" />
      </div>
   );
};

export default InputScript;
