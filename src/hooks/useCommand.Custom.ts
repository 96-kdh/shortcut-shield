// src/hooks/useCustomCommand.ts
import { useEffect, useMemo, useState } from "react";
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
   const save = async (value: CustomRules) => {
      await browser.storage.sync.set({ customRulesMap: customToRaw(value) });
      setCustomCommands(new Map(value));
   };

   /**
    * 새 Custom 로직 커맨드 추가
    */
   const addCustomCommand = async (cmd: CommandType, urls: string[], logic: string, isActive = true) => {
      const next = new Map(customCommands);
      next.set(cmd, { urls: new Set(urls.filter(Boolean)), isActive, logic });
      await save(next);
   };

   /**
    * 기존 CustomRule 업데이트 (urls, logic, isActive 중 일부)
    */
   const updateCustomCommand = async (
      cmd: CommandType,
      opts: Partial<Omit<CustomRule, "urls">> & { urls?: string[] },
   ) => {
      const next = new Map(customCommands);
      const rule = next.get(cmd);
      if (!rule) return;
      if (opts.urls) rule.urls = new Set(opts.urls.filter(Boolean));
      if (typeof opts.isActive === "boolean") rule.isActive = opts.isActive;
      if (typeof opts.logic === "string") rule.logic = opts.logic;
      next.set(cmd, rule);
      await save(next);
   };

   const deleteCustomCommand = async (cmd: CommandType) => {
      const next = new Map(customCommands);
      next.delete(cmd);
      await save(next);
   };

   // 활성화 토글 유틸
   const setCustomActive = async (cmd: CommandType, active: boolean) => {
      await updateCustomCommand(cmd, { isActive: active });
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
      addCustomCommand,
      updateCustomCommand,
      deleteCustomCommand,
      setCustomActive,
   };
}
