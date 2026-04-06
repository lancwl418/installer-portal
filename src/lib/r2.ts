import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType = "application/octet-stream"
) {
  const bucket = process.env.CF_R2_BUCKET;
  if (!bucket) throw new Error("Missing CF_R2_BUCKET");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const base = (process.env.CF_R2_PUBLIC_BASE || "").replace(/\/+$/, "");
  if (!base) throw new Error("Missing CF_R2_PUBLIC_BASE");
  return `${base}/${key}`;
}
