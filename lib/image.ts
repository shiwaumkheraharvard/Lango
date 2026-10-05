"use client";

/** Downscale a photo to a JPEG data URL small enough for the API body limit and localStorage. */
export async function fileToDataUrl(file: File, maxDim = 1400, quality = 0.72): Promise<string> {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.drawImage(bitmap, 0, 0, w, h);
  if ("close" in bitmap) (bitmap as ImageBitmap).close();
  return canvas.toDataURL("image/jpeg", quality);
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall through */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function dataUrlToBase64(dataUrl: string): { mediaType: string; data: string } {
  const [head, data] = dataUrl.split(",");
  const mediaType = head.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  return { mediaType, data };
}
