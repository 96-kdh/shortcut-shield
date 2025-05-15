import browser from "webextension-polyfill";

import { rawToCommand } from "@/hooks/useCommand.DoNothing.ts";
import { detectModifierKey, detectTriggerKey, matches } from "@/lib/utils.ts";
import { type CommandType, type RawCommandRules } from "@/types";

import { type RawCustomRules, rawToCustom } from "./hooks/useCommand.Custom.ts";

// Map<command, Set<url>>
let doNothingRule = new Map();
let customRules = new Map<
   string,
   {
      urls: Set<string>;
      isActive: boolean;
      logic: string;
   }
>();

// 로드
browser.storage.sync
   .get(["doNothingRulesMap", "customRulesMap"])
   .then((res: { doNothingRulesMap?: RawCommandRules; customRulesMap?: RawCustomRules }) => {
      doNothingRule = rawToCommand(res.doNothingRulesMap);
      customRules = rawToCustom(res.customRulesMap);
   });

// storage 변경 감지
browser.storage.onChanged.addListener((changes, area) => {
   if (area !== "sync") return;
   if (changes.rulesMap) doNothingRule = rawToCommand(changes.rulesMap.newValue);
   if (changes.customRulesMap) customRules = rawToCustom(changes.customRulesMap.newValue);
});

// 단축키 차단
document.addEventListener(
   "keydown",
   (e) => {
      const modKey = detectModifierKey(e);
      const trigKey = detectTriggerKey(e);
      if (!modKey || !trigKey) return;

      const cmd: CommandType = `${modKey}+${trigKey}`;

      const href = window.location.href;

      // 1) Custom Logic 우선 처리
      const cr = customRules.get(cmd);
      if (cr && cr.isActive) {
         for (const pattern of cr.urls) {
            if (matches(pattern, href)) {
               e.preventDefault();
               e.stopImmediatePropagation();

               browser.runtime
                  .sendMessage({
                     type: "RUN_CUSTOM_LOGIC",
                     code: cr.logic,
                  })
                  .then((result) => {
                     console.log("sendMessage result: ", result);
                  })
                  .catch((error) => console.error("Custom logic error", error));

               return;
            }
         }
      }

      // 2) 기존 Do Nothing 처리
      const commandRule = doNothingRule.get(cmd);
      if (commandRule && commandRule.isActive) {
         for (const pattern of commandRule!.urls) {
            if (matches(pattern, href)) {
               e.preventDefault();
               e.stopImmediatePropagation();
               console.log(`[shortcutShield] blocked ${cmd} on ${href}`);
               break;
            }
         }
      }
   },
   { capture: true },
);
