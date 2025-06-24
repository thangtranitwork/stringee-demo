import { StringeeClient } from 'stringee';

export function connectStringeeClient(token, onIncomingCall, onConnected) {
  const client = new StringeeClient();

  client.connect(token);

  client.on('connect', () => {
    console.log('[StringeeClient] Connected');
    onConnected(true);
  });

  client.on('disconnect', () => {
    console.log('[StringeeClient] Disconnected');
    onConnected(false);
  });

  client.on('incomingcall', (incomingCall) => {
    console.log('[StringeeClient] Incoming call');
    onIncomingCall(incomingCall);
  });

  return client;
}
