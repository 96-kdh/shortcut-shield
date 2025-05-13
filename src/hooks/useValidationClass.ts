import { useRef } from "react";

const useValidationClass = (className: string) => {
   const insertedSpans = useRef<Map<HTMLElement, HTMLElement>>(new Map());

   const mark = (
      el: HTMLElement | null,
      options?: {
         msg: string;
         position?: InsertPosition;
      },
   ) => {
      if (!el) return;
      el.classList.add(className);

      if (options?.msg) {
         const existing = insertedSpans.current.get(el);
         if (existing) {
            existing.remove();
            insertedSpans.current.delete(el);
         }

         const span = document.createElement("span");
         span.className = "text-destructive text-sm flex items-center gap-1";
         span.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="lucide lucide-triangle-alert-icon lucide-triangle-alert w-4 h-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            ${options.msg}
         `;

         el.insertAdjacentElement(options.position ?? "afterend", span);
         insertedSpans.current.set(el, span);
      }
   };

   const clear = (el: HTMLElement | null) => {
      if (!el) return;
      el.classList.remove(className);

      const span = insertedSpans.current.get(el);
      if (span) {
         span.remove();
         insertedSpans.current.delete(el);
      }
   };
   return { mark, clear };
};

export default useValidationClass;
