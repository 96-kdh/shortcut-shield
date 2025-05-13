import browser from "webextension-polyfill";

import { rawToCommand } from "@/hooks/useCommand.ts";
import { detectModifierKey, detectTriggerKey, matches } from "@/lib/utils.ts";
import { type CommandRules, type CommandType, type RawCommandRules } from "@/types";

// Map<command, Set<url>>
let rules: CommandRules = new Map();

// 1) 로드
browser.storage.sync.get("rulesMap").then((res: { rulesMap?: RawCommandRules }) => {
   rules = rawToCommand(res.rulesMap);
});

// 2) 단축키 차단
document.addEventListener(
   "keydown",
   (e) => {
      const modKey = detectModifierKey(e);
      const trigKey = detectTriggerKey(e);
      if (!modKey || !trigKey) return;

      const cmd: CommandType = `${modKey}+${trigKey}`;
      const commandRule = rules.get(cmd);
      if (!commandRule?.isActive) return;

      const href = window.location.href;
      for (const pattern of commandRule!.urls) {
         if (matches(pattern, href)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log(`[shortcutShield] blocked ${cmd} on ${href}`);
            break;
         }
      }
   },
   { capture: true },
);
