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
      script: string;
   }
>();

let isActiveDelayEnter: boolean = false;
let lastKeydownTime = 0;

// 로드
browser.storage.sync
   .get(["doNothingRulesMap", "customRulesMap", "isActiveDelayEnter"])
   .then(
      (res: { doNothingRulesMap?: RawCommandRules; customRulesMap?: RawCustomRules; isActiveDelayEnter?: boolean }) => {
         doNothingRule = rawToCommand(res.doNothingRulesMap);
         customRules = rawToCustom(res.customRulesMap);
         isActiveDelayEnter = res.isActiveDelayEnter || false;
      },
   );

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
      const elapsed = Date.now() - lastKeydownTime;
      if (isActiveDelayEnter && e.code === "Enter" && elapsed < 500) {
         e.preventDefault();
         e.stopPropagation();
         console.log("enter blocked");
         return;
      }

      lastKeydownTime = Date.now();

      const modKey = detectModifierKey(e);
      const trigKey = detectTriggerKey(e);
      if (!modKey || !trigKey) return;

      const cmd: CommandType = `${modKey}+${trigKey}`;

      const href = window.location.href;

      // 1) Custom script 우선 처리
      const cr = customRules.get(cmd);
      if (cr && cr.isActive) {
         for (const pattern of cr.urls) {
            if (matches(pattern, href)) {
               e.preventDefault();
               e.stopImmediatePropagation();

               browser.runtime
                  .sendMessage({
                     type: "RUN_CUSTOM_script",
                     code: cr.script,
                  })
                  .then((result) => {
                     console.log("sendMessage result: ", result);
                  })
                  .catch((error) => console.error("Custom script error", error));

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
