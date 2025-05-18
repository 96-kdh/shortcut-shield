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
import useCommandCustom, { rawToCustom, customToRaw, type RawCustomRules } from '@/hooks/useCommand.Custom';
import { SyncStorageKey } from '@/constant';

describe('useCommandCustom hook', () => {
   const defaultRaw: RawCustomRules = {
      'Ctrl+S': {
         urls: ['https://example.com'],
         script: 'alert(1)',
         isActive: true,
         scriptDescription: 'test',
      },
   };

   beforeEach(() => {
      vi.mocked(browser.storage.sync.get).mockResolvedValue({ [SyncStorageKey.Custom]: defaultRaw });
      vi.mocked(browser.storage.sync.set).mockResolvedValue(undefined as any);
      vi.clearAllMocks();
   });

   it('loads initial commands from storage', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandCustom());
      await waitForNextUpdate();

      expect(browser.storage.sync.get).toHaveBeenCalledWith(SyncStorageKey.Custom);

      const { commands } = result.current;
      expect(commands instanceof Map).toBe(true);
      expect(commands.has('Ctrl+S')).toBe(true);
      const rule = commands.get('Ctrl+S');
      expect(rule).toMatchObject({
         urls: new Set(['https://example.com']),
         script: 'alert(1)',
         isActive: true,
         scriptDescription: 'test',
      });
   });

   it('updateCommand adds or updates a rule and persists to storage', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandCustom());
      await waitForNextUpdate();

      await act(async () => {
         await result.current.updateCommand(
            'Alt+F',
            ['https://foo.com'],
            false,
            'console.log()',
            'desc',
         );
      });

      const expectedRaw: RawCustomRules = {
         'Ctrl+S': defaultRaw['Ctrl+S'],
         'Alt+F': {
            urls: ['https://foo.com'],
            isActive: false,
            script: 'console.log()',
            scriptDescription: 'desc',
         },
      };
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.Custom]: expectedRaw });

      const { commands } = result.current;
      expect(commands.has('Alt+F')).toBe(true);
      expect(commands.get('Alt+F')?.script).toBe('console.log()');
   });

   it('delCommand removes a rule and persists change', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandCustom());
      await waitForNextUpdate();

      await act(async () => {
         await result.current.delCommand('Ctrl+S');
      });

      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.Custom]: {} });
      expect(result.current.commands.has('Ctrl+S')).toBe(false);
   });

   it('setActive toggles isActive and saves', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCommandCustom());
      await waitForNextUpdate();

      await act(async () => {
         await result.current.setActive('Ctrl+S', false);
      });

      const expectedRaw: RawCustomRules = {
         'Ctrl+S': {
            urls: ['https://example.com'],
            script: 'alert(1)',
            isActive: false,
            scriptDescription: 'test',
         },
      };
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ [SyncStorageKey.Custom]: expectedRaw });
      expect(result.current.commands.get('Ctrl+S')?.isActive).toBe(false);
   });

   it('rawToCustom and customToRaw are inverse operations', () => {
      const raw: RawCustomRules = defaultRaw;
      const customMap = rawToCustom(raw);
      const backRaw = customToRaw(customMap);
      expect(backRaw).toEqual(raw);
   });
});
