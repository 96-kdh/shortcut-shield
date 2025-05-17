import { useCallback, useEffect, useRef } from "react";

import { injectionErrorClassName, injectionWarnClassName } from "@/constant";

// Module-level map to share spans across hook instances
// Map<targetElement, insertedSpan>
const insertedSpans = new Map<HTMLElement, HTMLElement>();

const useValidationClass = () => {
   const _mark = useCallback(
      (
         type: "error" | "warning",
         el: HTMLElement,
         options?: {
            msg: string;
            position?: InsertPosition;
            parentPosition?: InsertPosition;
         },
      ) => {
         const className = type === "error" ? injectionErrorClassName : injectionWarnClassName;
         const textColor = type === "error" ? "text-destructive" : "text-[#FBBF24]";

         // 1) 클래스 추가
         el.classList.add(className);

         if (options?.msg) {
            // 2) 기존 span 있으면 제거
            const existing = insertedSpans.get(el);
            if (existing) {
               existing.remove();
               insertedSpans.delete(el);
            }

            // 3) 메시지 span 생성 및 삽입
            const span = document.createElement("span");
            span.className = `${textColor} text-sm flex gap-1 mt-1`;
            span.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="lucide lucide-triangle-alert-icon lucide-triangle-alert w-4 h-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <p>${options.msg}</p>
         `;

            if (options.parentPosition) {
               el.parentElement?.insertAdjacentElement(options.parentPosition ?? "afterend", span);
            } else {
               el.insertAdjacentElement(options.position ?? "afterend", span);
            }
            insertedSpans.set(el, span);
         }
      },
      [],
   );

   const mark = {
      error: (
         el: HTMLElement | null,
         options?: {
            msg: string;
            position?: InsertPosition;
            parentPosition?: InsertPosition;
         },
      ) => (el ? _mark("error", el, options) : undefined),
      warning: (
         el: HTMLElement | null,
         options?: {
            msg: string;
            position?: InsertPosition;
            parentPosition?: InsertPosition;
         },
      ) => (el ? _mark("warning", el, options) : undefined),
   };

   const clear = useCallback((el: HTMLElement | null) => {
      if (!el) return;

      el.classList.remove(injectionErrorClassName, injectionWarnClassName);
      const span = insertedSpans.get(el);
      if (span) {
         span.remove();
         insertedSpans.delete(el);
      }
   }, []);

   useEffect(() => {
      return () => insertedSpans.clear();
   }, []);

   return { clear, mark };
};

export default useValidationClass;
