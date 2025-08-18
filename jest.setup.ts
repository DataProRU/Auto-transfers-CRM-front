import '@testing-library/jest-dom';

// Полифилл TextEncoder/TextDecoder для jsdom (нужно для react-router-dom и некоторых пакетов)
if (typeof globalThis.TextEncoder === 'undefined') {
  class PolyfillTextEncoder {
    encode(input: string) {
      return new Uint8Array(Buffer.from(input, 'utf-8'));
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).TextEncoder = PolyfillTextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  class PolyfillTextDecoder {
    decode(input: Uint8Array) {
      return Buffer.from(input).toString('utf-8');
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).TextDecoder = PolyfillTextDecoder;
}
