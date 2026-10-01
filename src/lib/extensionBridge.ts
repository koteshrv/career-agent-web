export const EXTENSION_SOURCE = 'CAREERAGENT_WEB';

export function debugLog(source: string, msg: string, data: any = {}) {
  try {
    fetch('http://localhost:9999/log', {
      method: 'POST',
      body: JSON.stringify({ source, msg, data, time: new Date().toISOString() })
    }).catch(() => {});
  } catch (e) {}
}
export interface ExtensionRequest {
  action: string;
  payload?: any;
}

/**
 * Checks if the extension is injected and listening.
 * The extension's content script should listen to this ping and respond with a pong.
 */
export async function pingExtension(): Promise<boolean> {
  try {
    const response = await sendExtensionMessage({ action: 'ping' }, 500);
    return response?.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Sends a message to the companion Chrome extension via window.postMessage.
 * The extension's content script must be injected on this domain to bridge the message to the background service worker.
 */
export function sendExtensionMessage(request: ExtensionRequest, timeoutMs = 15000): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }

    const messageId = crypto.randomUUID();

    const listener = (event: MessageEvent) => {
      // Ensure the message is from our window and is an extension response
      if (
        event.source === window &&
        event.data &&
        event.data.type === 'CAREER_AGENT_EXT_RESPONSE' &&
        event.data.messageId === messageId
      ) {
        window.removeEventListener('message', listener);
        debugLog('WEB_APP', 'Received response from extension', { messageId, error: event.data.error });
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.payload);
        }
      }
    };

    window.addEventListener('message', listener);

    debugLog('WEB_APP', 'Sending postMessage to extension', { action: request.action, messageId });

    // Send the message to the content script
    window.postMessage(
      {
        source: EXTENSION_SOURCE,
        type: 'CAREER_AGENT_EXT_REQUEST',
        messageId,
        action: request.action,
        payload: request.payload,
      },
      '*'
    );

    // Timeout if the extension doesn't respond (e.g. not installed or taking too long)
    setTimeout(() => {
      debugLog('WEB_APP', 'Timeout reached waiting for extension response', { action: request.action, messageId, timeoutMs });
      window.removeEventListener('message', listener);
      reject(new Error('EXTENSION_TIMEOUT'));
    }, timeoutMs);
  });
}

/**
 * Helper to convert a File object to a Base64 string for IPC transfer
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:application/pdf;base64, prefix
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
