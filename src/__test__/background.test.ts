/** @vitest-environment node */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest';
import browser from 'webextension-polyfill';
import { sendMsgType } from '@/constant';

// Mock webextension-polyfill BEFORE importing background
vi.mock('webextension-polyfill', () => {
   return {
      default: {
         tabs: {
            query: vi.fn(),
         },
         debugger: {
            attach: vi.fn(),
            sendCommand: vi.fn(),
            detach: vi.fn(),
         },
         runtime: {
            onMessage: {
               addListener: vi.fn(),
            },
         },
      },
   };
});

// Import the background module to register the listener
import '@/background';

describe('background onMessage listener', () => {
   let listener;

   beforeEach(async () => {
      vi.resetModules();
      vi.clearAllMocks();

      // Re-import after reset

      const mod = await import('@/background');
      // Grab the registered listener
      listener = browser.runtime.onMessage.addListener.mock.calls[0][0];
   });

   it('ignores messages with wrong type', async () => {
      const msg = { type: 'OTHER' };
      const res = await listener(msg, {});
      expect(res).toBeUndefined();
   });

   it('returns error when no active tab', async () => {
      // Setup: wrong query result
      (browser.tabs.query).mockResolvedValue([]);
      const msg = { type: sendMsgType, code: '1+1' };
      const res = await listener(msg, {});
      expect(browser.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
      expect(res).toHaveProperty('exceptionDetails');
      expect(res.exceptionDetails).toHaveProperty('text', 'No active tab');
   });

   it('executes code successfully and returns status 200', async () => {
      // Setup active tab
      (browser.tabs.query).mockResolvedValue([{ id: 42 }]);
      // debugger.attach succeeds
      (browser.debugger.attach).mockResolvedValue(undefined);
      // enable and evaluate succeed without exceptionDetails
      (browser.debugger.sendCommand)
         .mockResolvedValueOnce(undefined)
         .mockResolvedValueOnce({ result: { value: 3 } });
      // detach succeeds
      (browser.debugger.detach).mockResolvedValue(undefined);

      const msg = { type: sendMsgType, code: '1+2' };
      const res = await listener(msg, {});
      expect(browser.debugger.attach).toHaveBeenCalledWith({ tabId: 42 }, '1.3');
      expect(browser.debugger.sendCommand).toHaveBeenCalledWith({ tabId: 42 }, 'Runtime.enable');
      expect(browser.debugger.sendCommand).toHaveBeenCalledWith(
         { tabId: 42 },
         'Runtime.evaluate',
         expect.objectContaining({ expression: '1+2' }),
      );
      expect(browser.debugger.detach).toHaveBeenCalledWith({ tabId: 42 });
      expect(res.status).toBe(200);
   });

   it('returns exception details when evaluation throws exception', async () => {
      (browser.tabs.query).mockResolvedValue([{ id: 7 }]);
      (browser.debugger.attach).mockResolvedValue(undefined);
      // enable succeeds
      (browser.debugger.sendCommand)
         .mockResolvedValueOnce(undefined)
         .mockResolvedValueOnce({ exceptionDetails: { exception: { className: 'Err', description: 'fail' } } });
      (browser.debugger.detach).mockResolvedValue(undefined);

      const msg = { type: sendMsgType, code: 'bad()' };
      const res = await listener(msg, {});
      expect(res.status).toBe(400);
      expect(res.exceptionDetails.name).toBe('Err');
      expect(res.exceptionDetails.description).toBe('fail');
   });

   it('handles attach error gracefully', async () => {
      (browser.tabs.query).mockResolvedValue([{ id: 5 }]);
      (browser.debugger.attach).mockRejectedValue(new Error('attach failed'));
      // Prevent evaluation crash: make sendCommand return empty object
      (browser.debugger.sendCommand).mockResolvedValue({});
      (browser.debugger.detach).mockResolvedValue(undefined);

      const msg = { type: sendMsgType, code: 'x' };
      const res = await listener(msg, {});
      expect(res.status).toBe(500);
      expect(res.exceptionDetails.name).toContain('attach error');
   });
});
