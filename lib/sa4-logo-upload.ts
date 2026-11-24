const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const SA4_LOGO_MAX_LENGTH = 350000;

export function encodeSa4Logo(image: CanvasImageSource, width: number, height: number, createCanvas: () => HTMLCanvasElement = () => document.createElement("canvas")): string {
  if (!width || !height) throw new Error("La imagen no tiene un tamaño válido. Exporta el logo como PNG o JPG y vuelve a elegirlo.");
  for (const limit of [640, 512, 384]) {
    const canvas = createCanvas();
    const scale = Math.min(1, limit / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se ha podido preparar el logo en este navegador. Prueba con una imagen PNG o JPG.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    // Browsers without WebP export return PNG. Keep it if it fits; otherwise use JPEG.
    const webp = canvas.toDataURL("image/webp", 0.85);
    if (/^data:image\/(webp|png);base64,/.test(webp) && webp.length <= SA4_LOGO_MAX_LENGTH) return webp;
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55]) {
      const jpeg = canvas.toDataURL("image/jpeg", quality);
      if (/^data:image\/jpeg;base64,/.test(jpeg) && jpeg.length <= SA4_LOGO_MAX_LENGTH) return jpeg;
    }
  }
  throw new Error("No se ha podido reducir el logo para guardarlo. Exporta una copia como JPG y vuelve a elegirla.");
}

export async function prepareSa4Logo(file: File): Promise<string> {
  if (!file.size || file.size > MAX_FILE_BYTES) throw new Error("Elige una imagen de hasta 20 MB. El archivo seleccionado está vacío o es demasiado grande.");
  if (file.type && !file.type.startsWith("image/") && !/\.(png|jpe?g|jfif|webp|gif|avif|svg|bmp|heic|heif)$/i.test(file.name)) {
    throw new Error("El archivo debe ser una imagen. Elige el logo en PNG, JPG, WebP, SVG o AVIF.");
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      timer = setTimeout(() => reject(new Error("La imagen tarda demasiado en abrirse. Exporta el logo como PNG o JPG y vuelve a elegirlo.")), 20000);
      image.onload = () => { clearTimeout(timer); resolve(); };
      image.onerror = () => { clearTimeout(timer); reject(new Error("Este navegador no puede abrir esta imagen. Exporta el logo como PNG o JPG y vuelve a elegirlo.")); };
      image.src = url;
    });
    return encodeSa4Logo(image, image.naturalWidth, image.naturalHeight);
  } catch (cause) {
    if (cause instanceof Error && cause.name === "Error") throw cause;
    throw new Error("No se ha podido preparar esta imagen. Exporta el logo como PNG o JPG y vuelve a elegirlo.");
  } finally {
    clearTimeout(timer);
    image.onload = null; image.onerror = null;
    URL.revokeObjectURL(url);
  }
}
