import { useEffect, useMemo, useState } from "react";
import browser from "webextension-polyfill";

import { KEY_DISPLAY_MAP, NAMED_KEYS } from "@/constant";
import type { CommandRules, CommandType, RawCommandRules, RawRule } from "@/types";

const useCommandUtils = () => {
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
};

const useCommandDoNothing = () => {
   const [commands, _setCommand] = useState<CommandRules>(new Map());

   const _save = async (value: CommandRules) => {
      await browser.storage.sync.set({ doNothingRulesMap: commandToRaw(value) });
      _setCommand(new Map(value));
   };

   const updateCommand = async (_cmd: CommandType, _urls: string[], _isActive: boolean) => {
      if (_cmd.split("+").length !== 2) return;

      const newMap = new Map(commands);
      const rule = { urls: new Set<string>(), isActive: newMap.get(_cmd)?.isActive || _isActive };
      // const rule = newMap.get(_cmd) || { urls: new Set<string>(), isActive: _isActive };

      for (const _url of _urls) if (_url) rule.urls.add(_url);
      rule.isActive = _isActive;

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
      browser.storage.sync.get("doNothingRulesMap").then((res: { doNothingRulesMap?: RawCommandRules }) => {
         _setCommand(rawToCommand(res.doNothingRulesMap));
      });
   }, []);

   return { commands, updateCommand, delCommand, setActive, ...useCommandUtils() };
};

/** 로컬스토리지 → Map<CommandType, CommandRule> */
export function rawToCommand(raw: RawCommandRules = {}): CommandRules {
   const result: CommandRules = new Map();
   for (const [cmd, { urls, isActive }] of Object.entries(raw) as [CommandType, RawRule][]) {
      result.set(cmd, { urls: new Set(urls), isActive });
   }
   return result;
}

/** Map<CommandType, CommandRule> → 로컬스토리지용 객체 */
export function commandToRaw(map: CommandRules): RawCommandRules {
   const raw: RawCommandRules = {};
   for (const [cmd, { urls, isActive }] of map.entries()) {
      raw[cmd] = {
         urls: Array.from(urls),
         isActive,
      };
   }
   return raw;
}

/**
 * @param key 입력된 키 문자열 (예: "A", "comma", "PageUp" 등)
 * @returns 목록에 있는 키면 true
 */
export function isValidKey(key: string): boolean {
   const k = key.trim();
   // 1글자짜리 알파벳/숫자 허용
   if (/^[A-Za-z0-9]$/.test(k)) return true;
   // Named 키 허용 (대소문자 구분 없이)
   if (new Set(Object.values(NAMED_KEYS).map((k) => k.toLowerCase())).has(k.toLowerCase())) return true;
   return false;
}

/**
 * 허용할 프로토콜 목록을 화이트리스트로 체크합니다.
 * - http, https, file 만 허용하려면 이대로 쓰세요.
 */
export function isValidUrl(urlStr: string): boolean {
   try {
      const u = new URL(urlStr);
      return ["http:", "https:"].includes(u.protocol);
   } catch {
      return false;
   }
}

export default useCommandDoNothing;
