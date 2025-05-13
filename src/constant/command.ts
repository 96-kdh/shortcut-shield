export enum NAMED_KEYS {
   ArrowUp = "ArrowUp",
   ArrowDown = "ArrowDown",
   ArrowLeft = "ArrowLeft",
   ArrowRight = "ArrowRight",
   PageUp = "PageUp",
   PageDown = "PageDown",
   Home = "Home",
   End = "End",
   Comma = "Comma",
   Period = "Period",
   Space = "Space",
   Insert = "Insert",
   Delete = "Delete",
}

export const KEY_DISPLAY_MAP: Record<NAMED_KEYS, string> = {
   [NAMED_KEYS.ArrowUp]: "↑",
   [NAMED_KEYS.ArrowDown]: "↓",
   [NAMED_KEYS.ArrowLeft]: "←",
   [NAMED_KEYS.ArrowRight]: "→",
   [NAMED_KEYS.PageUp]: "⇞",
   [NAMED_KEYS.PageDown]: "⇟",
   [NAMED_KEYS.Home]: "↖",
   [NAMED_KEYS.End]: "↘",
   [NAMED_KEYS.Comma]: ",",
   [NAMED_KEYS.Period]: ".",
   [NAMED_KEYS.Space]: "Space",
   [NAMED_KEYS.Insert]: "Ins",
   [NAMED_KEYS.Delete]: "Del",
};

export const injectionMissingClassName = "missingField";
