/** @vitest-environment jsdom */
import { renderHook, act } from '@testing-library/react-hooks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock webextension-polyfill before importing browser
vi.mock('webextension-polyfill', () => {
   const storageMock = {
      get: vi.fn(),
      set: vi.fn(),
   };
   return {
      default: {
         storage: {
            sync: storageMock,
         },
      },
   };
});

import browser from 'webextension-polyfill';
import useCommandDoNothing, { rawToDoNothing, doNothingToRaw, type RawDoNothingRules } from '@/hooks/useCommand.DoNothing';
import { SyncStorageKey } from '@/constant';

describe('useCommandDoNothing hook', () => {
   const defaultRaw: RawDoNothingRules = {
      'Ctrl+R': { urls: ['https://test.com'], isActive: false },
   };

   beforeEach(() => {
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.DoNothing]: defaultRaw });
      vi.mocked(browser.storage.sync.set).mockResolvedValue(undefined as any);
      vi.clearAllMocks();
   });

   it('loads initial commands from storage', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandDoNothing());
      await waitForNextUpdate();

      expect(browser.storage.sync.get).toHaveBeenCalledWith(SyncStorageKey.DoNothing);

      const { commands } = result.current;
      expect(commands instanceof Map).toBe(true);
      expect(commands.has('Ctrl+R')).toBe(true);
      const rule = commands.get('Ctrl+R');
      expect(rule).toMatchObject({ urls: new Set(['https://test.com']), isActive: false });
   });

   it('updateCommand adds or updates a rule and persists to storage', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandDoNothing());
      await waitForNextUpdate();

      await act(async () => {
         await result.current.updateCommand('Alt+G', ['https://foo.com'], true);
      });

      const expectedRaw: RawDoNothingRules = {
         'Ctrl+R': defaultRaw['Ctrl+R'],
         'Alt+G': { urls: ['https://foo.com'], isActive: true },
      };
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.DoNothing]: expectedRaw });

      const { commands } = result.current;
      expect(commands.has('Alt+G')).toBe(true);
      expect(commands.get('Alt+G')?.isActive).toBe(true);
   });

   it('delCommand removes a rule and persists change', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandDoNothing());
      await waitForNextUpdate();

      await act(async () => {
         await result.current.delCommand('Ctrl+R');
      });

      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.DoNothing]: {} });
      expect(result.current.commands.has('Ctrl+R')).toBe(false);
   });

   it('setActive toggles isActive and saves', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandDoNothing());
      await waitForNextUpdate();

      await act(async () => {
         await result.current.setActive('Ctrl+R', true);
      });

      const expectedRaw: RawDoNothingRules = {
         'Ctrl+R': { urls: ['https://test.com'], isActive: true },
      };
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.DoNothing]: expectedRaw });
      expect(result.current.commands.get('Ctrl+R')?.isActive).toBe(true);
   });

   it('rawToDoNothing and doNothingToRaw are inverse operations', () => {
      const raw: RawDoNothingRules = defaultRaw;
      const custom = rawToDoNothing(raw);
      const backRaw = doNothingToRaw(custom);
      expect(backRaw).toEqual(raw);
   });
});
