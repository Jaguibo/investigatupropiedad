import sharp from "sharp";

await sharp("investiga_tu_propiedad.png")
  .resize(180, 180, { fit: "contain" })
  .webp({ quality: 82 })
  .toFile("investiga_tu_propiedad-180.webp");

await sharp("investiga_tu_propiedad.png")
  .resize(96, 96, { fit: "contain" })
  .webp({ quality: 82 })
  .toFile("investiga_tu_propiedad-96.webp");

await sharp("investiga_tu_propiedad.png")
  .resize(1200, 630, { fit: "contain", background: "#0B2F34" })
  .webp({ quality: 82 })
  .toFile("og-image.webp");

console.log("Images optimized");
