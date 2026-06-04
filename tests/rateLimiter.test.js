const { LRUCache } = require('lru-cache');

describe('LRU fallback store — bounded memory', () => {
  test('evicts oldest entries when max is exceeded', () => {
    const store = new LRUCache({ max: 5, ttl: 60000 });
    for (let i = 0; i < 10; i++) {
      store.set(`ip-${i}`, { count: 1, windowStart: Date.now() });
    }
    expect(store.size).toBeLessThanOrEqual(5);
  });

  test('entries expire after TTL', async () => {
    const store = new LRUCache({ max: 100, ttl: 50 });
    store.set('ip-test', { count: 1, windowStart: Date.now() });
    expect(store.has('ip-test')).toBe(true);
    await new Promise(r => setTimeout(r, 100));
    expect(store.has('ip-test')).toBe(false);
  });

  test('store accepts 10000 unique IPs without crashing', () => {
    const store = new LRUCache({ max: 10000, ttl: 60000 });
    for (let i = 0; i < 15000; i++) {
      store.set(`192.168.${Math.floor(i / 255)}.${i % 255}`, { count: i });
    }
    expect(store.size).toBeLessThanOrEqual(10000);
  });
});
