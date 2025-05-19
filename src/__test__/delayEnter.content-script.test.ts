/** @vitest-environment jsdom */
import {  act } from '@testing-library/react-hooks';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

// Mock webextension-polyfill BEFORE any imports
vi.mock('webextension-polyfill', () => {
   const storageSyncMock = {
      get: vi.fn(),
      set: vi.fn(),
   };
   const onChangedMock = { addListener: vi.fn() };
   return {
      default: {
         storage: { sync: storageSyncMock, onChanged: onChangedMock },
         runtime: { sendMessage: vi.fn().mockResolvedValue(undefined) },
      },
   };
});

import browser from 'webextension-polyfill';
import { SyncStorageKey } from '@/constant';
import type { RawExtensionRules } from "@/components/popup/tabs/TabContents.Extension.tsx";

describe('Integration: delay enter + content-script', () => {
   const url = 'https://example.com/page';
   const rawExtensionRules: RawExtensionRules = { isActiveDelayEnter: true };

   beforeEach(() => {
      vi.resetModules();
      vi.clearAllMocks();
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.Extension]: {} });

      vi.useFakeTimers()
   });

   afterEach(() => {
      vi.useRealTimers()
   })

   it('should call callback after 1 second', () => {
      const callback = vi.fn()

      // 3) 실제 로직: 1초 뒤에 실행될 함수 등록
      setTimeout(() => {
         callback('done')
      }, 1000)

      // 아직 실행 전
      expect(callback).not.toBeCalled()

      // 4) 타이머를 1초(1000ms)만큼 흘려줌
      vi.advanceTimersByTime(1000)

      // 이제 호출됐어야 함
      expect(callback).toHaveBeenCalledWith('done')
   })


   it("Enter the default delay",async () => {
      await browser.storage.sync.set({ [SyncStorageKey.Extension]: rawExtensionRules })

      // Ensure storage.set called with our rule
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.Extension]: rawExtensionRules });
      // Mock storage.get for content-script load
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.Extension]: rawExtensionRules });

      // Dynamic import content-script after setting up mock
      const { handleKeydown } = await import('@/content-script');
      // Simulate page URL
      Object.defineProperty(window, 'location', { value: new URL(url) });

      const insertKeys = 'hi, hello world';
      for (const char of insertKeys) {
         // Dispatch a matching keydown via handler
         const ev = new KeyboardEvent('keydown', {
            code: char,
            bubbles: true,
            cancelable: true,
         });
         handleKeydown(ev);
         expect(ev.defaultPrevented).toBe(false);
      }

      vi.advanceTimersByTime(501)

      // Dispatch a matching keydown via handler
      const enterEv = new KeyboardEvent('keydown', {
         code: 'Enter',
         bubbles: true,
         cancelable: true,
      });
      handleKeydown(enterEv);
      expect(enterEv.defaultPrevented).toBe(false);
   });

   it(`"shiftKey + Enter" events are not blocked.`,async () => {
      await browser.storage.sync.set({ [SyncStorageKey.Extension]: rawExtensionRules })

      // Ensure storage.set called with our rule
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.Extension]: rawExtensionRules });
      // Mock storage.get for content-script load
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.Extension]: rawExtensionRules });

      // Dynamic import content-script after setting up mock
      const { handleKeydown } = await import('@/content-script');
      // Simulate page URL
      Object.defineProperty(window, 'location', { value: new URL(url) });

      // Dispatch a matching keydown via handler
      const enterEv = new KeyboardEvent('keydown', {
         code: 'Enter',
         shiftKey: true,
         bubbles: true,
         cancelable: true,
      });
      handleKeydown(enterEv);
      expect(enterEv.defaultPrevented).toBe(false);
   });

   it(`Consecutive "Enter" events are not blocked.`, async () => {
      await browser.storage.sync.set({ [SyncStorageKey.Extension]: rawExtensionRules })

      // Ensure storage.set called with our rule
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.Extension]: rawExtensionRules });
      // Mock storage.get for content-script load
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.Extension]: rawExtensionRules });

      // Dynamic import content-script after setting up mock
      const { handleKeydown } = await import('@/content-script');

      // Simulate page URL
      Object.defineProperty(window, 'location', { value: new URL(url) });

      const insertKeys = 'hi, hello world';
      for (const char of insertKeys) {
         // Dispatch a matching keydown via handler
         const ev = new KeyboardEvent('keydown', {
            code: char,
            bubbles: true,
            cancelable: true,
         });
         handleKeydown(ev);
         expect(ev.defaultPrevented).toBe(false);
      }

      // Dispatch a matching keydown via handler
      const firstEnter = new KeyboardEvent('keydown', {
         code: 'Enter',
         bubbles: true,
         cancelable: true,
      });
      handleKeydown(firstEnter);
      expect(firstEnter.defaultPrevented).toBe(true);

      // Dispatch a matching keydown via handler
      const secEnter = new KeyboardEvent('keydown', {
         code: 'Enter',
         bubbles: true,
         cancelable: true,
      });
      handleKeydown(secEnter);
      expect(secEnter.defaultPrevented).toBe(false);
   });
});
