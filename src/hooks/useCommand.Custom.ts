import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { SyncStorageKey } from "@/constant";
import { useCommandUtils } from "@/hooks/useCommand.DoNothing.ts";
import type { CommandType } from "@/types";

type CustomRuleOf<UrlsType> = {
   urls: UrlsType;
   isActive: boolean;
   script: string;
   scriptDescription?: string;
};

// JSON 저장용
export type RawCustomRule = CustomRuleOf<string[]>;
export type RawCustomRules = Record<CommandType, RawCustomRule>;
// 런타임용
export type CustomRule = CustomRuleOf<Set<string>>;
export type CustomRules = Map<CommandType, CustomRule>;

/**
 * useCommandCustom 훅
 */
export default function useCommandCustom() {
   const [commands, _setCommands] = useState<CustomRules>(new Map());

   // storage 업데이트 함수
   const _save = async (value: CustomRules) => {
      await browser.storage.sync.set({ [SyncStorageKey.Custom]: customToRaw(value) });
      _setCommands(new Map(value));
   };

   const updateCommand = async (
      _cmd: CommandType,
      _urls: string[],
      _isActive: boolean,
      _script: string,
      _scriptDescription?: string,
   ) => {
      if (_cmd.split("+").length !== 2) return;

      const newMap = new Map(commands);
      const rule = {
         urls: new Set<string>(),
         isActive: _isActive,
         script: _script,
         scriptDescription: _scriptDescription,
      };

      for (const _url of _urls) if (_url) rule.urls.add(_url);

      newMap.set(_cmd, rule);
      await _save(newMap);
   };

   const delCommand = async (cmd: CommandType) => {
      const next = new Map(commands);
      next.delete(cmd);
      await _save(next);
   };

   // 활성화 토글 유틸
   const setActive = async (_cmd: CommandType, _isActive: boolean) => {
      const newMap = new Map(commands);
      const rule = newMap.get(_cmd);
      if (!rule) return;
      newMap.set(_cmd, {
         urls: rule.urls,
         isActive: _isActive,
         script: rule.script,
         scriptDescription: rule.scriptDescription,
      });
      await _save(newMap);
   };

   useEffect(() => {
      browser.storage.sync.get(SyncStorageKey.Custom).then((res: { [SyncStorageKey.Custom]?: RawCustomRules }) => {
         _setCommands(rawToCustom(res[SyncStorageKey.Custom]));
      });
   }, []);

   return {
      commands,
      updateCommand,
      delCommand,
      setActive,
      ...useCommandUtils(),
   };
}

/**
 * rawStorage → Map<CommandType, CustomRule>
 */
export function rawToCustom(raw: RawCustomRules = {}): CustomRules {
   const map: CustomRules = new Map();
   for (const [cmd, { urls, isActive, script, scriptDescription }] of Object.entries(raw) as [
      CommandType,
      { urls: string[]; isActive: boolean; script: string; scriptDescription?: string },
   ][]) {
      map.set(cmd, {
         urls: new Set(urls),
         isActive,
         script,
         scriptDescription,
      });
   }
   return map;
}

/**
 * CustomRules → Storage 직렬화 객체
 */
export function customToRaw(map: CustomRules): RawCustomRules {
   const raw: RawCustomRules = {} as any;
   for (const [cmd, { urls, isActive, script, scriptDescription }] of map.entries()) {
      raw[cmd] = { urls: Array.from(urls), isActive, script, scriptDescription };
   }
   return raw;
}
