/** @vitest-environment jsdom */
import { renderHook, act } from '@testing-library/react-hooks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
import { sendMsgType, SyncStorageKey } from "@/constant";
import useCommandCustom, { type RawCustomRules } from "@/hooks/useCommand.Custom";

describe('Integration: useCommandCustom + content-script', () => {
   const url = 'https://example.com/page';
   const cmd = 'Ctrl+S';
   const scriptCode = 'alert(1)';
   const scriptDesc = 'test script';
   const rawCustomRules: RawCustomRules = {
      [cmd]: { urls: [url], isActive: true, script: scriptCode, scriptDescription: scriptDesc }
   };

   beforeEach(() => {
      // Clear module cache and mocks
      vi.resetModules();
      vi.clearAllMocks();
      // Default empty custom rules
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.Custom]: {} });
   });

   it('runs custom script on keydown when rule active', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandCustom());
      await waitForNextUpdate();
      await act(async () => {
         await result.current.updateCommand(cmd, [url], true, scriptCode, scriptDesc);
      });

      // Ensure storage.set called with our rule
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.Custom]: rawCustomRules });

      // Mock storage.get for content-script load
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.Custom]: rawCustomRules });

      // Import content-script after mock
      const { handleKeydown } = await import('@/content-script');
      Object.defineProperty(window, 'location', { value: new URL(url) });

      const ev = new KeyboardEvent('keydown', { code: 'KeyS', ctrlKey: true, bubbles: true, cancelable: true });
      handleKeydown(ev);

      expect(ev.defaultPrevented).toBe(true);
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith({ type: sendMsgType, code: scriptCode });
   });

   it('does not run custom script when rule inactive', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandCustom());
      await waitForNextUpdate();
      const inactiveCustom = { [cmd]: { urls: [url], isActive: false, script: scriptCode } };
      await act(async () => {
         await result.current.updateCommand(cmd, [url], false, scriptCode);
      });

      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.Custom]: inactiveCustom });

      // Mock storage.get to return inactive rule
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.Custom]: inactiveCustom });

      const { handleKeydown } = await import('@/content-script');
      Object.defineProperty(window, 'location', { value: new URL(url) });

      const ev = new KeyboardEvent('keydown', { code: 'KeyS', ctrlKey: true, bubbles: true, cancelable: true });
      handleKeydown(ev);

      expect(ev.defaultPrevented).toBe(false);
      expect(browser.runtime.sendMessage).not.toHaveBeenCalled();
   });
});
