import { javascript } from "@codemirror/lang-javascript";
import { type Diagnostic, lintGutter, linter } from "@codemirror/lint";
import { EditorState, StateEffect } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { parse } from "acorn";
import { EditorView, basicSetup } from "codemirror";
import React, { type Dispatch, type SetStateAction, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as ts from "typescript";

import { Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { usePopup } from "@/hooks/contexts/usePopup.ts";
import { useTheme } from "@/hooks/contexts/useTheme.ts";
import useCommandCustom from "@/hooks/useCommand.Custom.ts";
import { browserGlobals } from "@/lib/utils.ts";

export const popupScriptInputId = "shortcutShieldPopupScriptInputId";

const basicExtension = [basicSetup, javascript({ typescript: true }), linter(combinedLinter()), lintGutter()];

export default function InputScript({
   view,
   setView,
   checkScript,
}: {
   view: EditorView | undefined;
   setView: Dispatch<SetStateAction<EditorView | undefined>>;
   checkScript: () => Diagnostic[];
}) {
   const { t } = useTranslation();
   const { commands } = useCommandCustom();
   const { currentViewProps, setCurrentViewProps } = usePopup();
   const { theme } = useTheme();

   const ref = useRef<HTMLDivElement>(null);
   const initialScriptRef = useRef<string | undefined>(currentViewProps.script);

   const scriptDescValue = useMemo(() => {
      if (currentViewProps.scriptDescription) return currentViewProps.scriptDescription;
      if (currentViewProps.command) {
         const rule = commands.get(currentViewProps.command.value);
         if (rule?.scriptDescription) return rule.scriptDescription;
      }
   }, [currentViewProps.scriptDescription, currentViewProps.command?.value, commands]);

   // doc이 바뀌었을 때 실행할 코드
   const onDocChange = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
         const newCode = update.state.doc.toString();
         setCurrentViewProps.script(newCode);
      }
   });

   useEffect(() => {
      if (!ref.current) return;

      let initScript;

      if (
         currentViewProps.command?.type === "readOnly" &&
         currentViewProps.command?.value &&
         !currentViewProps.script
      ) {
         const rules = commands.get(currentViewProps.command.value);
         if (rules?.script) initScript = rules.script;
      } else {
         initScript = initialScriptRef.current;
      }

      const state = EditorState.create({
         doc: initScript || `${t("placeholderScript")}\n\n\n`,
         extensions: [...basicExtension, onDocChange],
      });

      const v = new EditorView({ state, parent: ref.current });
      setView(v);

      return () => v.destroy();
   }, [commands]);

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
            <TooltipProvider>
               <Tooltip>
                  <TooltipTrigger>
                     <label
                        className="text-primary-foreground shadow-xs rounded-xs px-[8px] py-[2px] bg-green-500 hover:bg-green-700 cursor-pointer"
                        onClick={() => {
                           const errors = checkScript();
                           if (errors.length === 0) toast.success("No errors found. ");
                           else toast.warning(`Found ${errors.length} errors.`);
                        }}
                     >
                        {t("checkCode")}
                     </label>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-xs whitespace-normal break-words">
                     <div className="space-y-1 text-sm">
                        <p className="text-sm">{t("tooltipScript")}</p>
                     </div>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         </div>
         <div ref={ref} className="min-h-1" id={popupScriptInputId} />

         <div className="my-4">
            <label className="text-sm font-bold flex gap-1">
               Script Description <span className="opacity-45">(Optional)</span>
            </label>
            <Input
               value={scriptDescValue}
               placeholder="E.g. Do Nothing"
               className={`w-full max-w-96 bg-transparent border-0 shadow-lg`}
               onChange={(e) => setCurrentViewProps.scriptDescription(e.target.value)}
            />
         </div>
      </div>
   );
}

export function getDiagnostics(code: string): Diagnostic[] {
   const fileName = "file.js";

   // 1) TS 옵션: ESNext만 포함, DOM 타입은 런타임 스캔으로 처리
   const options: ts.CompilerOptions = {
      allowJs: true,
      checkJs: true,
      noEmit: true,
      strict: true,
      target: ts.ScriptTarget.ESNext,
      lib: ["ESNext"],
   };

   // 3) console은 별도 제한된 메서드만 허용
   const consoleLib = `
declare namespace console {
  function log(...args: any[]): void;
  function info(...args: any[]): void;
  function warn(...args: any[]): void;
  function error(...args: any[]): void;
}
`;

   // 4) 가상 lib 파일 합치기
   const libSource = `${browserGlobals}\n${consoleLib}`;
   const libFileName = "lib.generated.d.ts";

   // 5) LanguageServiceHost 구성
   const host: ts.LanguageServiceHost = {
      getScriptFileNames: () => [fileName, libFileName],
      getScriptVersion: () => "0",
      getScriptSnapshot: (name) => {
         if (name === fileName) {
            return ts.ScriptSnapshot.fromString(code);
         }
         if (name === libFileName) {
            return ts.ScriptSnapshot.fromString(libSource);
         }
         return undefined;
      },
      getCurrentDirectory: () => "",
      getCompilationSettings: () => options,
      getDefaultLibFileName: () => libFileName,
      // 파일 존재 여부 확인
      fileExists: (name) => name === fileName || name === libFileName,
      // 파일 읽기 함수
      readFile: (name) => {
         if (name === fileName) return code;
         if (name === libFileName) return libSource;
         return undefined;
      },
   };

   // 6) LanguageService로 진단 수집
   const service = ts.createLanguageService(host);
   const syn = service.getSyntacticDiagnostics(fileName);
   const sem = service.getSemanticDiagnostics(fileName);

   // 7) Diagnostic[] 형태로 매핑
   return [...syn, ...sem].map((d) => {
      const start = d.start ?? 0;
      const length = d.length ?? 1;
      const message = typeof d.messageText === "string" ? d.messageText : d.messageText.messageText;
      return { from: start, to: start + length, severity: "error", message };
   });
}

function jsLinter(): (view: EditorView) => Diagnostic[] {
   return (view: EditorView): Diagnostic[] => {
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
}

function combinedLinter(): (view: EditorView) => Diagnostic[] {
   return (view: EditorView): Diagnostic[] => {
      const jsErrors = jsLinter()(view);
      const tsErrors = getDiagnostics(view.state.doc.toString());
      return [...jsErrors, ...tsErrors];
   };
}
