export type CommandType = `${ModifierKey}+${string}`;

// JSON 저장용: URLs 배열과 isActive 플래그
export interface RawRule {
   urls: string[];
   isActive: boolean;
}
// JSON 에 저장할 때는 string[] 형태로 → RawCommandRules
export type RawCommandRules = Record<CommandType, RawRule>;

// 런타임용: Set<string> + isActive 플래그
export interface CommandRule {
   urls: Set<string>;
   isActive: boolean;
}
export type CommandRules = Map<CommandType, CommandRule>;

export enum ModifierKey {
   Meta = "Meta",
   Ctrl = "Ctrl",
   Alt = "Alt",

   Null = "",
}
