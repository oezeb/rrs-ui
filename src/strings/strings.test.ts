
import stringsZh from './strings-zh.json';
import stringsEn from './strings-en.json';

// strings-*.json are should have same elements.
let zhKeys = new Set(Object.keys(stringsZh))
let enKeys = new Set(Object.keys(stringsEn));
zhKeys.forEach((key) => {
    it(`strings-en.json should have key ${key}`, () => {
        expect(enKeys.has(key)).toBe(true);
    });
});
enKeys.forEach((key) => {
    it(`strings-zh.json should have key ${key}`, () => {
        expect(zhKeys.has(key)).toBe(true);
    });
});