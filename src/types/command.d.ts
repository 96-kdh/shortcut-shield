export enum ModifierKey {
   Meta = "Meta",
   Ctrl = "Ctrl",
   Alt = "Alt",

   Null = "",
}
export type CommandType = `${ModifierKey}+${string}`;
