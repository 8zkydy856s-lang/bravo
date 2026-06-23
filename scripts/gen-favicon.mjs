import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFileSync } from 'fs';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#f6f1e6"/><g transform="translate(-6.774,-12.799) scale(1.1495)"><rect x="14" y="27" width="1.15" height="11" fill="#bd9a66"/><rect x="40.85" y="27" width="1.15" height="11" fill="#bd9a66"/><path d="M9 21.5 Q28.0 17 47.0 21.5 L44.0 27 L12 27 Z" fill="#4a3024"/><circle cx="28" cy="31" r="3.0" fill="#eebb8c"/><path d="M25.0 30.6 Q28 25.9 31.0 30.6 Q28 28.6 25.0 30.6 Z" fill="#9a6a42"/><path d="M23 36.5 Q28 33.2 33 36.5 L33 39.5 L23 39.5 Z" fill="#3a5170"/><rect x="12" y="38" width="32" height="13" rx="2" fill="#edc090"/><rect x="47" y="39" width="11" height="9" rx="1" fill="#edc090"/><path d="M50.9 36 L54.1 36 L53.5667 39.2 L51.4333 39.2 Z" fill="#d49a64"/><path d="M52.5 36 Q50.1 32.0 51.5 31.2" fill="none" stroke="#7a9a55" stroke-width="1.04"/><path d="M52.5 36 Q54.9 32.0 53.5 31.2" fill="none" stroke="#7a9a55" stroke-width="1.04"/><circle cx="52.5" cy="31.2" r="1.2" fill="#b0468a"/><circle cx="28" cy="53" r="7" fill="none" stroke="#4a3024" stroke-width="2.0"/><circle cx="28" cy="53" r="1.4" fill="#4a3024"/><circle cx="52.5" cy="53" r="4" fill="none" stroke="#4a3024" stroke-width="1.4"/><circle cx="52.5" cy="53" r="1.0" fill="#4a3024"/><path d="M12.3 59 L15.7 59 L15.1333 62.4 L12.8667 62.4 Z" fill="#d49a64"/><path d="M14 59 Q11.45 54.75 13 53.9" fill="none" stroke="#7a9a55" stroke-width="1.105"/><path d="M14 59 Q16.55 54.75 15 53.9" fill="none" stroke="#7a9a55" stroke-width="1.105"/><circle cx="14" cy="53.9" r="1.275" fill="#f5c518"/></g></svg>`;

const buf = Buffer.from(svg);
await sharp(buf, { density: 384 }).resize(32, 32).png().toFile('app/icon.png');
await sharp(buf, { density: 384 }).resize(180, 180).png().toFile('app/apple-icon.png');
const ico32 = await sharp(buf, { density: 384 }).resize(32, 32).png().toBuffer();
const ico16 = await sharp(buf, { density: 384 }).resize(16, 16).png().toBuffer();
writeFileSync('app/favicon.ico', await pngToIco([ico16, ico32]));
console.log('Ikonky pregenerovany.');
