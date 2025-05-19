import browser from "webextension-polyfill";

import type { RawExtensionRules } from "@/components/popup/tabs/TabContents.Extension.tsx";
import { SyncStorageKey, sendMsgType } from "@/constant";
import { type CustomRule, type RawCustomRules, rawToCustom } from "@/hooks/useCommand.Custom.ts";
import { type DoNothingRule, type RawDoNothingRules, rawToDoNothing } from "@/hooks/useCommand.DoNothing.ts";
import { detectModifierKey, detectTriggerKey, matches } from "@/lib/utils.ts";
import type { CommandType } from "@/types";

// Internal state
let doNothingRule = new Map<CommandType, DoNothingRule>();
let customRules = new Map<CommandType, CustomRule>();
let extensionRules: RawExtensionRules = { isActiveDelayEnter: false };

let lastKeydownTime = 0;
let lastKeydownCode = "";

// 로드
browser.storage.sync
   .get([SyncStorageKey.DoNothing, SyncStorageKey.Custom, SyncStorageKey.Extension])
   .then(
      (res: {
         [SyncStorageKey.DoNothing]?: RawDoNothingRules;
         [SyncStorageKey.Custom]?: RawCustomRules;
         [SyncStorageKey.Extension]?: RawExtensionRules;
      }) => {
         doNothingRule = rawToDoNothing(res[SyncStorageKey.DoNothing]);
         customRules = rawToCustom(res[SyncStorageKey.Custom]);
         extensionRules = res[SyncStorageKey.Extension] ?? {
            isActiveDelayEnter: false,
         };
      },
   );

// storage 변경 감지
browser.storage.onChanged.addListener((changes, area) => {
   if (area !== "sync") return;
   if (changes[SyncStorageKey.DoNothing]) {
      doNothingRule = rawToDoNothing(changes[SyncStorageKey.DoNothing].newValue);
   }
   if (changes[SyncStorageKey.Custom]) {
      customRules = rawToCustom(changes[SyncStorageKey.Custom].newValue);
   }
   if (changes[SyncStorageKey.Extension]) {
      extensionRules = changes[SyncStorageKey.Extension].newValue;
   }
});

/**
 * Handles keydown events according to extension rules.
 */
export function handleKeydown(e: KeyboardEvent) {
   // Delay Enter logic exceptions
   if (e.shiftKey && e.code === "Enter") return;
   else if (lastKeydownCode === "Enter" && e.code === "Enter") return;
   lastKeydownCode = e.code;

   // Delay Enter logic
   const elapsed = Date.now() - lastKeydownTime;
   lastKeydownTime = Date.now();
   if (extensionRules.isActiveDelayEnter && e.code === "Enter" && elapsed < 500) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
   }

   const modKey = detectModifierKey(e);
   const trigKey = detectTriggerKey(e);
   if (!modKey || !trigKey) return;

   const cmd: CommandType = `${modKey}+${trigKey}`;
   const href = window.location.href;

   // Custom script rules first
   const cr = customRules.get(cmd);
   if (cr && cr.isActive) {
      for (const pattern of cr.urls) {
         if (matches(pattern, href)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            void browser.runtime.sendMessage({ type: sendMsgType, code: cr.script });
            return;
         }
      }
   }

   // Do-Nothing rules
   const dr = doNothingRule.get(cmd);
   if (dr && dr.isActive) {
      for (const pattern of dr.urls) {
         if (matches(pattern, href)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log(`[shortcutShield] blocked ${cmd} on ${href}`);
            break;
         }
      }
   }
}

// Attach global keydown listener
document.addEventListener("keydown", handleKeydown, { capture: true });
