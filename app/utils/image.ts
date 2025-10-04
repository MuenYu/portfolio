/**
 * Use the browser's image loading to load an image and
 * grab the `src` it chooses from a `srcSet`
 */
type LoadImageFromSrcSetArgs = {
  src?: string;
  srcSet?: string;
  sizes?: string;
};

export async function loadImageFromSrcSet({
  src,
  srcSet,
  sizes,
}: LoadImageFromSrcSetArgs): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      if (!src && !srcSet) {
        throw new Error('No image src or srcSet provided');
      }

      const tempImage = new Image();

      if (src) {
        tempImage.src = src;
      }

      if (srcSet) {
        tempImage.srcset = srcSet;
      }

      if (sizes) {
        tempImage.sizes = sizes;
      }

      const onLoad = () => {
        tempImage.removeEventListener('load', onLoad);
        const source = tempImage.currentSrc;
        resolve(source);
      };

      tempImage.addEventListener('load', onLoad);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/**
 * Generates a transparent png of a given width and height
 */
export async function generateImage(width = 1, height = 1): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    if (!ctx) {
      canvas.remove();
      reject(new Error('Failed to obtain 2D context'));
      return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    canvas.toBlob(blob => {
      if (!blob) {
        canvas.remove();
        reject(new Error('Video thumbnail failed to load'));
        return;
      }
      const image = URL.createObjectURL(blob);
      canvas.remove();
      resolve(image);
    });
  });
}

/**
 * Use native html image `srcSet` resolution for non-html images
 */
export async function resolveSrcFromSrcSet({
  srcSet,
  sizes,
}: {
  srcSet: string;
  sizes?: string;
}): Promise<string> {
  const sources = await Promise.all(
    srcSet.split(', ').map(async srcString => {
      const [src, width] = srcString.split(' ');
      const size = Number(width.replace('w', ''));
      const image = await generateImage(size);
      return { src, image, width };
    })
  );

  const fakeSrcSet = sources.map(({ image, width }) => `${image} ${width}`).join(', ');
  const fakeSrc = await loadImageFromSrcSet({ srcSet: fakeSrcSet, sizes });

  const output = sources.find(src => src.image === fakeSrc);
  if (!output) {
    throw new Error('Unable to resolve source from srcSet');
  }

  return output.src;
}
