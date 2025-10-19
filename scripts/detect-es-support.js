/**
 * ES Support Detection Script for Obsidian
 *
 * This script detects which ECMAScript features are supported by the current
 * JavaScript environment (Obsidian desktop or mobile).
 *
 * Usage:
 * 1. Open Obsidian Developer Console (Ctrl/Cmd + Shift + I)
 * 2. Copy and paste this entire script
 * 3. Results will be logged to console
 *
 * Results from testing (2025):
 * - Obsidian Desktop: ES2021 fully supported
 * - Obsidian Mobile (iOS/Android): ES2021 fully supported
 */

(function detectESSupport() {
  const results = {
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor
    },
    features: {}
  };

  const tests = [
    // ES2015 (ES6)
    ['ES2015: Arrow functions', () => typeof (() => {}) === 'function'],
    ['ES2015: Classes', () => typeof class {} === 'function'],
    ['ES2015: Promises', () => typeof Promise !== 'undefined'],
    ['ES2015: Symbols', () => typeof Symbol !== 'undefined'],
    ['ES2015: let/const', () => { try { eval('let x = 1; const y = 2;'); return true; } catch(e) { return false; }}],

    // ES2016
    ['ES2016: Array.includes', () => typeof Array.prototype.includes === 'function'],
    ['ES2016: Exponentiation (**)', () => { try { return eval('2 ** 3') === 8; } catch(e) { return false; }}],

    // ES2017
    ['ES2017: Async/await', () => (async () => {}).constructor.name === 'AsyncFunction'],
    ['ES2017: Object.values', () => typeof Object.values === 'function'],
    ['ES2017: Object.entries', () => typeof Object.entries === 'function'],

    // ES2018
    ['ES2018: Rest/spread for objects', () => { try { eval('({...{}})'); return true; } catch(e) { return false; }}],
    ['ES2018: Promise.finally', () => typeof Promise.prototype.finally === 'function'],
    ['ES2018: Async iteration', () => { try { eval('(async function*(){})'); return true; } catch(e) { return false; }}],

    // ES2019
    ['ES2019: Array.flat', () => typeof Array.prototype.flat === 'function'],
    ['ES2019: Array.flatMap', () => typeof Array.prototype.flatMap === 'function'],
    ['ES2019: Object.fromEntries', () => typeof Object.fromEntries === 'function'],

    // ES2020
    ['ES2020: Optional chaining (?.)', () => { try { eval('({})?.prop'); return true; } catch(e) { return false; }}],
    ['ES2020: Nullish coalescing (??)', () => { try { eval('null ?? 1'); return true; } catch(e) { return false; }}],
    ['ES2020: BigInt', () => typeof BigInt !== 'undefined'],
    ['ES2020: Promise.allSettled', () => typeof Promise.allSettled === 'function'],
    ['ES2020: globalThis', () => typeof globalThis !== 'undefined'],
    ['ES2020: import.meta', () => { try { eval('import.meta'); return true; } catch(e) { return false; }}],

    // ES2021
    ['ES2021: String.replaceAll', () => typeof String.prototype.replaceAll === 'function'],
    ['ES2021: Promise.any', () => typeof Promise.any === 'function'],
    ['ES2021: Logical assignment (&&=)', () => { try { eval('let x = true; x &&= false;'); return true; } catch(e) { return false; }}],

    // ES2022
    ['ES2022: Array.at', () => typeof Array.prototype.at === 'function'],
    ['ES2022: Object.hasOwn', () => typeof Object.hasOwn === 'function'],
    ['ES2022: Top-level await', () => { try { eval('await Promise.resolve()'); return true; } catch(e) { return false; }}],
  ];

  tests.forEach(([name, test]) => {
    try {
      results.features[name] = test();
    } catch (e) {
      results.features[name] = false;
    }
  });

  // Format output
  console.log('=== ES SUPPORT DETECTION ===\n');
  console.log('ENVIRONMENT:');
  console.log(JSON.stringify(results.environment, null, 2));
  console.log('\nFEATURES:');
  Object.entries(results.features).forEach(([feature, supported]) => {
    console.log(`${supported ? '✓' : '✗'} ${feature}`);
  });

  // Create copyable text output
  const output = [
    '=== ES SUPPORT DETECTION ===',
    '',
    'ENVIRONMENT:',
    JSON.stringify(results.environment, null, 2),
    '',
    'FEATURES:',
    ...Object.entries(results.features).map(([feature, supported]) =>
      `${supported ? '✓' : '✗'} ${feature}`
    )
  ].join('\n');

  console.log('\n=== COPY TEXT BELOW ===\n');
  console.log(output);

  return results;
})();
