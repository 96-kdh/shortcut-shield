import { useEffect, useMemo, useState } from "react";
import browser from "webextension-polyfill";

import { KEY_DISPLAY_MAP, NAMED_KEYS, SyncStorageKey } from "@/constant";
import type { CommandType } from "@/types";

type DoNothingRuleOf<UrlsType> = {
   urls: UrlsType;
   isActive: boolean;
};

// JSON 저장용
export type RawDoNothingRule = DoNothingRuleOf<string[]>;
export type RawDoNothingRules = Record<CommandType, RawDoNothingRule>;

// 런타임용
export type DoNothingRule = DoNothingRuleOf<Set<string>>;
export type DoNothingRules = Map<CommandType, DoNothingRule>;

export default function useCommandDoNothing() {
   const [commands, _setCommand] = useState<DoNothingRules>(new Map());

   const _save = async (value: DoNothingRules) => {
      await browser.storage.sync.set({ [SyncStorageKey.DoNothing]: doNothingToRaw(value) });
      _setCommand(new Map(value));
   };

   const updateCommand = async (_cmd: CommandType, _urls: string[], _isActive: boolean) => {
      if (_cmd.split("+").length !== 2) return;

      const newMap = new Map(commands);
      const rule = { urls: new Set<string>(), isActive: _isActive };
      // const rule = newMap.get(_cmd) || { urls: new Set<string>(), isActive: _isActive };

      for (const _url of _urls) if (_url) rule.urls.add(_url);

      newMap.set(_cmd, rule);
      await _save(newMap);
   };

   const delCommand = async (_cmd: CommandType) => {
      const newMap = new Map(commands);
      newMap.delete(_cmd);

      await _save(newMap);
   };

   const setActive = async (_cmd: CommandType, _isActive: boolean) => {
      const newMap = new Map(commands);
      const rule = newMap.get(_cmd);
      if (!rule) return;
      newMap.set(_cmd, { urls: rule.urls, isActive: _isActive });
      await _save(newMap);
   };

   // load
   useEffect(() => {
      browser.storage.sync
         .get(SyncStorageKey.DoNothing)
         .then((res: { [SyncStorageKey.DoNothing]?: RawDoNothingRules }) => {
            _setCommand(rawToDoNothing(res[SyncStorageKey.DoNothing]));
         });
   }, []);

   return { commands, updateCommand, delCommand, setActive, ...useCommandUtils() };
}

export function useCommandUtils() {
   const isMac = useMemo(() => navigator.platform.toUpperCase().includes("MAC"), []);

   // 3) 내부 “Meta+ArrowUp” 같은 문자열을 → “⌘↑” 로 바꿔주는 헬퍼
   function formatDisplay(command: string): string {
      return command
         .split("+")
         .map((part: NAMED_KEYS | string, idx) =>
            idx === 0 ? _displayModKey(part) : part in NAMED_KEYS ? KEY_DISPLAY_MAP[part as NAMED_KEYS] : part,
         )
         .join("");
   }

   function _displayModKey(key: string): string {
      switch (key) {
         case "Meta":
            return isMac ? "⌘" : "Win";
         case "Ctrl":
            return isMac ? "⌃" : "Ctrl";
         case "Alt":
            return isMac ? "⌥" : "Alt";
         default:
            return key;
      }
   }

   return { formatDisplay };
}

/** 로컬스토리지 → Map<CommandType, CommandRule> */
export function rawToDoNothing(raw: RawDoNothingRules = {}): DoNothingRules {
   const result: DoNothingRules = new Map();
   for (const [cmd, { urls, isActive }] of Object.entries(raw) as [CommandType, RawDoNothingRule][]) {
      result.set(cmd, { urls: new Set(urls), isActive });
   }
   return result;
}

/** Map<CommandType, CommandRule> → 로컬스토리지용 객체 */
export function doNothingToRaw(map: DoNothingRules): RawDoNothingRules {
   const raw: RawDoNothingRules = {};
   for (const [cmd, { urls, isActive }] of map.entries()) {
      raw[cmd] = {
         urls: Array.from(urls),
         isActive,
      };
   }
   return raw;
}
