import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "[Cloudinary] Variables d'environnement manquantes:",
    { CLOUDINARY_CLOUD_NAME: !!cloudName, CLOUDINARY_API_KEY: !!apiKey, CLOUDINARY_API_SECRET: !!apiSecret }
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export type UploadFolder = "profiles" | "covers" | "contents" | "certificates";

export async function uploadFile(
  file: File,
  folder: UploadFolder
): Promise<{ url: string; publicId: string }> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Configuration Cloudinary manquante. Vérifiez les variables d'environnement.");
  }

  console.log(`[Cloudinary] Upload démarré: ${file.name} (${file.size} octets) → ${folder}`);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `lbr-academy/${folder}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("[Cloudinary] Erreur upload:", error);
          return reject(new Error(`Upload Cloudinary échoué: ${error.message}`));
        }
        if (!result) {
          console.error("[Cloudinary] Aucun résultat retourné");
          return reject(new Error("Upload Cloudinary échoué: aucun résultat"));
        }
        console.log(`[Cloudinary] Upload réussi: ${result.secure_url}`);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
