export default `
const assert = {
    fail(actual, expected, message, operator, stackStartFunction) {
        throw new Error(message || \`Expected \${actual} \${operator} \${expected}\`);
    },
    ok(value, message) {
        if (!value) throw new Error(message || 'Assertion failed');
    },
    equal(actual, expected, message) {
        if (actual != expected) throw new Error(message || \`Expected \${actual} to equal \${expected}\`);
    },
    notEqual(actual, expected, message) {
        if (actual == expected) throw new Error(message || \`Expected \${actual} to not equal \${expected}\`);
    },
    deepEqual(actual, expected, message) {
        if (!isDeepEqual(actual, expected)) throw new Error(message || \`Expected \${actual} to deeply equal \${expected}\`);
    },
    notDeepEqual(actual, expected, message) {
        if (isDeepEqual(actual, expected)) throw new Error(message || \`Expected \${actual} to not deeply equal \${expected}\`);
    },
    strictEqual(actual, expected, message) {
        if (actual !== expected) throw new Error(message || \`Expected \${actual} to strictly equal \${expected}\`);
    },
    notStrictEqual(actual, expected, message) {
        if (actual === expected) throw new Error(message || \`Expected \${actual} to not strictly equal \${expected}\`);
    }
};

function isDeepEqual(a, b) {
    if (a === b) return true;

    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key) || !isDeepEqual(a[key], b[key])) return false;
    }

    return true;
}

export default assert;
`
