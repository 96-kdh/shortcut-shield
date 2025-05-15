// src/hooks/useCustomCommand.ts
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import type { CommandType } from "@/types";

/**
 * Custom logic rule: 다수 URL + JS 로직 + 활성화 플래그
 */
export interface CustomRule {
   urls: Set<string>;
   isActive: boolean;
   logic: string;
}
export type CustomRules = Map<CommandType, CustomRule>;
export type RawCustomRules = Record<CommandType, { urls: string[]; isActive: boolean; logic: string }>;

/**
 * rawStorage → Map<CommandType, CustomRule>
 */
export function rawToCustom(raw: RawCustomRules = {}): CustomRules {
   const map: CustomRules = new Map();
   for (const [cmd, { urls, isActive, logic }] of Object.entries(raw) as [
      CommandType,
      { urls: string[]; isActive: boolean; logic: string },
   ][]) {
      map.set(cmd, {
         urls: new Set(urls),
         isActive,
         logic,
      });
   }
   return map;
}

/**
 * CustomRules → Storage 직렬화 객체
 */
export function customToRaw(map: CustomRules): RawCustomRules {
   const raw: RawCustomRules = {} as any;
   for (const [cmd, { urls, isActive, logic }] of map.entries()) {
      raw[cmd] = { urls: Array.from(urls), isActive, logic };
   }
   return raw;
}

/**
 * useCustomCommand 훅
 */
export default function useCustomCommand() {
   const [customCommands, setCustomCommands] = useState<CustomRules>(new Map());

   // storage 업데이트 함수
   const _save = async (value: CustomRules) => {
      await browser.storage.sync.set({ customRulesMap: customToRaw(value) });
      setCustomCommands(new Map(value));
   };

   const updateCustomCommand = async (_cmd: CommandType, _urls: string[], _isActive: boolean, _logic: string) => {
      if (_cmd.split("+").length !== 2) return;

      const newMap = new Map(customCommands);
      const rule = { urls: new Set<string>(), isActive: _isActive, logic: _logic };

      for (const _url of _urls) if (_url) rule.urls.add(_url);

      newMap.set(_cmd, rule);
      await _save(newMap);
   };

   const deleteCustomCommand = async (cmd: CommandType) => {
      const next = new Map(customCommands);
      next.delete(cmd);
      await _save(next);
   };

   // 활성화 토글 유틸
   const setCustomActive = async (_cmd: CommandType, _isActive: boolean) => {
      const newMap = new Map(customCommands);
      const rule = newMap.get(_cmd);
      if (!rule) return;
      newMap.set(_cmd, { urls: rule.urls, isActive: _isActive, logic: rule.logic });
      await _save(newMap);
   };

   // 최초 로드 & 변경 감지
   useEffect(() => {
      // 초기 로드
      browser.storage.sync.get("customRulesMap").then((res: { customRulesMap?: RawCustomRules }) => {
         setCustomCommands(rawToCustom(res.customRulesMap));
      });
   }, []);

   return {
      customCommands,
      updateCustomCommand,
      deleteCustomCommand,
      setCustomActive,
   };
}
