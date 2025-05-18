import { type ClassValue, clsx } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

import { ModifierKey } from "@/types";
import { NAMED_KEYS } from "@/constant";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function detectModifierKey(e: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>): ModifierKey {
   if (e.metaKey) return ModifierKey.Meta;
   else if (e.ctrlKey) return ModifierKey.Ctrl;
   else if (e.altKey) return ModifierKey.Alt;
   else return <ModifierKey>"";
}

export function detectTriggerKey(e: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>): string {
   let _triggerKey: string;

   if (e.code.startsWith("Key")) _triggerKey = e.code.slice(3);
   else if (e.code.startsWith("Digit")) _triggerKey = e.code.slice(5);
   else if (e.code.startsWith("Numpad")) _triggerKey = e.code.slice(6);
   else _triggerKey = e.code.length === 1 ? e.code.toUpperCase() : e.code;

   if (!isValidKey(_triggerKey)) return "";
   return _triggerKey;
}

/**
 * URL 패턴 매칭:
 * - 패턴이 https://*.example.com 이면 example.com의 모든 서브도메인만 매칭
 * - 패턴이 https://example.com/path 이면 그 경로와 그 하위 경로만 매칭
 */
export function matches(pattern: string, href: string): boolean {
  let urlObj: URL;
  try {
    urlObj = new URL(href);
  } catch {
    return false;
  }

  // 1) 프로토콜 분리
  const idx = pattern.indexOf("://");
  if (idx < 0) return false;
  // pattern.slice(0, idx+1) => "http:" or "https:"
  const proto = pattern.slice(0, idx + 1).toLowerCase();
  const rest = pattern.slice(idx + 3); // hostPattern + optional path

  // 2) 프로토콜 검사
  if (urlObj.protocol !== proto) return false;

  // 3) 호스트 / 경로 분리
  const slashIndex = rest.indexOf("/");
  let hostPattern = slashIndex >= 0 ? rest.slice(0, slashIndex) : rest;
  let pathPattern = slashIndex >= 0 ? rest.slice(slashIndex) : "";

  // hostPattern에 실수로 붙은 맨 끝 슬래시 제거
  if (!pathPattern && hostPattern.endsWith("/")) {
    hostPattern = hostPattern.slice(0, -1);
  }

  hostPattern = hostPattern.toLowerCase();
  // pathPattern은 뒤의 슬래시만 지우고 그대로
  // ("/news/", "/news" 둘 다 "/news"로 맞춰주기)
  pathPattern = pathPattern.replace(/\/$/, "");

  // 4) 호스트 매칭
  const hostname = urlObj.hostname.toLowerCase();
  if (hostPattern.startsWith("*.")) {
    // 서브도메인만 허용: 루트 도메인은 제외
    const root = hostPattern.slice(2);
    if (hostname === root) return false;
    if (!hostname.endsWith("." + root)) return false;
  } else {
    if (hostname !== hostPattern) return false;
  }

  // 5) 경로 매칭
  if (!pathPattern) {
    // 경로 패턴 없으면 호스트만 매칭
    return true;
  }
  // URL의 pathname (쿼리 제외), 맨 끝 슬래시 제거
  const uPath = urlObj.pathname.replace(/\/$/, "");
  // 정확 일치하거나 하위 경로인 경우
  if (uPath === pathPattern) return true;
  if (uPath.startsWith(pathPattern + "/")) return true;

  return false;
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

export const browserGlobals = (()=> {
   if (typeof window === "undefined") return "";
   return Object.getOwnPropertyNames(window)
      .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name) && name !== "console")
      .map((name) => `declare const ${name}: any;`)
      .join("\n");
})();
