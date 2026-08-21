// يحوّل الصور الأصلية (src/originals) إلى WebP متعدد الأحجام + شعار أبيض + أيقونات الموقع.
// شغّله بـ: npm run images
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(ROOT, "src/originals");
const OUT = path.join(ROOT, "assets/img");

const BRAND_DARK = { r: 0x14, g: 0x21, b: 0x1a }; // #14211A

/**
 * الصور التسويقية: اسم الملف الناتج + عروض متجاوبة + جودة.
 * ملاحظة: بطاقات المنيو حالياً بدون صور (بطلب صاحب المطعم — الصور المرفقة
 * كانت للموقع عموماً، مو تمثيلاً دقيقاً لكل صنف). لو صارت عندك صور حقيقية
 * للأصناف، ضيفها في src/originals/ وأضف سطراً هنا بنفس النمط، ثم npm run images.
 */
const PHOTOS = [
  { file: "hero-box.png", out: "hero", widths: [640, 960, 1122], quality: 70 }, // 1122 = العرض الأصلي (لا تكبير وهمي)
];

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

function toHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

async function buildPhotos() {
  const meta = {};
  for (const spec of PHOTOS) {
    const input = path.join(SRC, spec.file);
    const img = sharp(input);
    const stats = await img.clone().stats();
    const mean = {
      r: Math.round(stats.channels[0].mean),
      g: Math.round(stats.channels[1].mean),
      b: Math.round(stats.channels[2].mean),
    };
    meta[spec.out] = { placeholder: toHex(mean) };

    let totalBytes = 0;
    for (const w of spec.widths) {
      const outPath = path.join(OUT, `${spec.out}-${w}.webp`);
      const buf = await sharp(input)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: spec.quality, effort: 6 })
        .toBuffer();
      await writeFile(outPath, buf);
      totalBytes += buf.length;
      console.log(`  ${spec.out}-${w}.webp  ${(buf.length / 1024).toFixed(1)}KB`);
    }
    meta[spec.out].totalKB = Math.round(totalBytes / 1024);
  }
  return meta;
}

/** يبني نسخة بيضاء من الشعار (نفس قناة الألفا، RGB=255) مقصوصة بإحكام حول العلامة */
async function buildWhiteLogo() {
  const input = path.join(SRC, "logo-mark.png");
  const trimmed = sharp(input).trim({ threshold: 10 });
  const { data, info } = await trimmed.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const white = Buffer.from(data); // نسخة قابلة للتعديل
  for (let i = 0; i < white.length; i += 4) {
    white[i] = 255;
    white[i + 1] = 255;
    white[i + 2] = 255;
    // القناة الرابعة (الشفافية) تبقى كما هي — هذا ما يرسم الشكل
  }

  const whiteLogo = sharp(white, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();

  // نسختان: عادية و2x للشاشات عالية الكثافة
  const targetWidth = 340;
  await whiteLogo
    .clone()
    .resize({ width: targetWidth })
    .toFile(path.join(OUT, "logo-white.png"));
  await sharp(white, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ width: targetWidth * 2 })
    .png()
    .toFile(path.join(OUT, "logo-white@2x.png"));

  return { buffer: Buffer.from(white), width: info.width, height: info.height };
}

/** يبني الأيقونات (favicon/apple-touch-icon) بوضع الشعار الأبيض على مربع بلون الهوية */
async function buildIcons(whiteLogoRaw) {
  const sizes = [32, 180, 192, 512];
  for (const size of sizes) {
    const pad = Math.round(size * 0.22); // هامش أمان حول العلامة
    const logoWidth = size - pad * 2;

    const logoPng = await sharp(whiteLogoRaw.buffer, {
      raw: { width: whiteLogoRaw.width, height: whiteLogoRaw.height, channels: 4 },
    })
      .resize({ width: logoWidth, withoutEnlargement: false })
      .png()
      .toBuffer();
    const logoMeta = await sharp(logoPng).metadata();

    const bg = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { ...BRAND_DARK, alpha: 1 },
      },
    });

    const top = Math.round((size - (logoMeta.height ?? logoWidth)) / 2);
    const left = Math.round((size - (logoMeta.width ?? logoWidth)) / 2);

    const name =
      size === 180 ? "apple-touch-icon.png" : size === 32 ? "favicon-32.png" : `icon-${size}.png`;

    await bg
      .composite([{ input: logoPng, top, left }])
      .png()
      .toFile(path.join(OUT, name));
    console.log(`  ${name}`);
  }
}

async function main() {
  await ensureDir(OUT);

  console.log("→ الصور التسويقية (WebP متجاوب):");
  const meta = await buildPhotos();

  console.log("→ الشعار الأبيض:");
  const whiteLogoRaw = await buildWhiteLogo();
  console.log(`  logo-white.png / logo-white@2x.png  (${whiteLogoRaw.width}x${whiteLogoRaw.height} مقصوص)`);

  console.log("→ أيقونات الموقع:");
  await buildIcons(whiteLogoRaw);

  await writeFile(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2));
  console.log("\nتم. الألوان البديلة (placeholder) محفوظة في assets/img/meta.json:");
  console.table(Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, v.placeholder])));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
