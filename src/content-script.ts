import browser from "webextension-polyfill";

import { rawToCommand } from "@/hooks/useCommand.DoNothing.ts";
import { detectModifierKey, detectTriggerKey, matches } from "@/lib/utils.ts";
import { type CommandRules, type CommandType, type RawCommandRules } from "@/types";

import { type RawCustomRules, rawToCustom } from "./hooks/useCommand.Custom.ts";

console.log("load content-script");

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
               try {
                  new Function("event", cr.logic)(e);
               } catch (err) {
                  console.error("Custom logic error", err);
               }
               e.preventDefault();
               e.stopImmediatePropagation();
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

// 사용자 코드 테스트 실행
browser.runtime.onMessage.addListener((msg, sender) => {
   console.log(msg);
   console.log("sender.tab?.id: ", sender.tab?.id);
   const tabId = msg.tabId;
   console.log("tabId: ", tabId);
   const fc = msg.funcTest;
   if (fc) fc();

   if (msg.type === "RUN_CUSTOM_LOGIC" && typeof msg.logic === "string") {
      try {
         // new Function("event", msg.logic)(undefined);
         // alert("kim");
      } catch (err) {
         console.error("Custom logic 실행 중 오류:", err);
      }
   }

   // if (msg.type === "RUN_CUSTOM_LOGIC" && typeof tabId === "number") {
   //    browser.scripting.executeScript({
   //       world: "ISOLATED",
   //       target: { tabId },
   //       func: (code) => {
   //          try {
   //             new Function("event", code)(undefined);
   //          } catch (err) {
   //             console.error("페이지 컨텍스트 오류:", err);
   //          }
   //       },
   //       args: [msg.logic],
   //    });
   // }
});
