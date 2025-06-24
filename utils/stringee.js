export function connectStringeeClient(token, onIncomingCall, onConnectionChange) {
  const client = new window.StringeeClient();
  client.connect(token);

  client.on('connect', () => {
    console.log('✅ Connected to Stringee server');
    if (onConnectionChange) onConnectionChange(true);
  });

  client.on('authen', (res) => {
    console.log('✅ Authenticated: ', res);
    if (res.r === 0) {
      console.log('Authentication successful');
    } else {
      console.log('Authentication failed:', res.message);
      if (onConnectionChange) onConnectionChange(false);
    }
  });

  client.on('incomingcall', (incomingCall) => {
    console.log('📞 Incoming call from:', incomingCall.fromNumber);
    onIncomingCall(incomingCall);
  });

  client.on('disconnect', () => {
    console.log('❌ Disconnected from Stringee server');
    if (onConnectionChange) onConnectionChange(false);
  });

  client.on('error', (error) => {
    console.error('Stringee client error:', error);
    if (onConnectionChange) onConnectionChange(false);
  });

  return client;
}