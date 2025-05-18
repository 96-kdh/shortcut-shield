// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import browser from "webextension-polyfill";

import { sendMsgType } from "@/constant";

// background.js
browser.runtime.onMessage.addListener(async (msg, sender) => {
   if (msg.type !== sendMsgType) return;

   let response = {
      status: 200,
      exceptionDetails: {
         name: "",
         description: "",
      },
   };

   // 1) 현재 활성 탭 찾기
   const tabs = await browser.tabs.query({ active: true, currentWindow: true });
   const tab = tabs[0];
   if (!tab?.id) return { exceptionDetails: { text: "No active tab" } };
   const tabId = tab.id;

   // 2) 디버거 붙이기 (프로토콜 버전 1.3)
   try {
      await browser.debugger.attach({ tabId }, "1.3");
   } catch (e) {
      console.error(e);
      response = {
         status: 500,
         exceptionDetails: {
            name: "browser.debugger.attach error",
            description: `Debugger Attach Failed: ${e.message}`,
         },
      };
   }

   // 3) Runtime.evaluate 명령 보내기
   try {
      await browser.debugger.sendCommand({ tabId }, "Runtime.enable");
      console.log("run code: ", msg.code);
      const res = await browser.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
         expression: msg.code,
         includeCommandLineAPI: true,
         awaitPromise: true,
         userGesture: true,
         returnByValue: true, // 원시 값은 result.value로 바로 받기
      });
      if (res.exceptionDetails) {
         console.log(res.exceptionDetails);
         response = {
            status: 400,
            exceptionDetails: {
               name: res.exceptionDetails.exception.className,
               description: res.exceptionDetails.exception.description,
            },
         };
      }
   } catch (e) {
      console.error(e);
      response = {
         status: 500,
         exceptionDetails: {
            name: "browser.debugger.sendCommand error",
            description: `Debugger Attach Failed: ${e.message}`,
         },
      };
   }

   // 4) 디버거 분리
   try {
      await browser.debugger.detach({ tabId });
   } catch {
      // detach 실패해도 무시
   }

   return response;
});
