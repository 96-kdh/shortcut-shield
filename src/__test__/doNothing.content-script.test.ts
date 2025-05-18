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
import useCommandDoNothing from '@/hooks/useCommand.DoNothing';
import { SyncStorageKey } from '@/constant';
import type { RawDoNothingRules } from '@/hooks/useCommand.DoNothing';

describe('Integration: useCommandDoNothing + content-script', () => {
   const url = 'https://example.com/page';
   const cmd = 'Ctrl+R';
   const rawRules: RawDoNothingRules = { [cmd]: { urls: [url], isActive: true } };

   beforeEach(() => {
      // 1) 모듈 캐시 초기화 ⇒ content-script를 다시 읽어옴
      vi.resetModules();

      // 2) mock 함수들 초기화 ⇒ 이전 테스트에서 쌓인 호출 기록·구현을 전부 지움
      vi.clearAllMocks();

      // 3) storage.get의 기본 반환값 설정
      //    (훅과 content-script 양쪽에서 초기 load를 시도할 때 쓰임)
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.DoNothing]: {} });
   });

   it('blocks keydown after registering a rule via hook', async () => {
      // Mount the hook and register rule
      const { result, waitForNextUpdate } = renderHook(() => useCommandDoNothing());
      await waitForNextUpdate();
      await act(async () => {
         await result.current.updateCommand(cmd, [url], true);
      });
      // Ensure storage.set called
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.DoNothing]: rawRules });

      // Now mock storage.get to return our rule for content-script load
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.DoNothing]: rawRules });

      // Dynamic import content-script after setting up mock
      const { handleKeydown } = await import('@/content-script');


      // Simulate page URL
      Object.defineProperty(window, 'location', { value: new URL(url) });

      // Dispatch a matching keydown via handler
      const ev = new KeyboardEvent('keydown', {
         code: 'KeyR',
         ctrlKey: true,
         bubbles: true,
         cancelable: true,
      });
      handleKeydown(ev);
      expect(ev.defaultPrevented).toBe(true);
   });

   it('does not block keydown when rule inactive', async () => {
      // Mount the hook and register inactive rule
      const { result, waitForNextUpdate } = renderHook(() => useCommandDoNothing());
      await waitForNextUpdate();
      const inactiveRules: RawDoNothingRules = { [cmd]: { urls: [url], isActive: false } };
      await act(async () => {
         await result.current.updateCommand(cmd, [url], false);
      });
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.DoNothing]: inactiveRules });

      // Mock storage.get to return inactiveRules
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.DoNothing]: inactiveRules });

      // Dynamic import content-script
      const { handleKeydown } = await import('@/content-script');
      Object.defineProperty(window, 'location', { value: new URL(url) });

      const ev = new KeyboardEvent('keydown', {
         code: 'KeyR',
         ctrlKey: true,
         bubbles: true,
         cancelable: true,
      });
      handleKeydown(ev);
      expect(ev.defaultPrevented).toBe(false);
   });
});
