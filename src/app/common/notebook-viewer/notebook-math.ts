import katex from 'katex';

export interface NotebookMath {
  styles: string | null;
  render(tex: string, displayMode: boolean): string;
}

const KATEX_FONT_URL = /url\(fonts\/([\w-]+\.woff2)\)[^;}]*/g;

let stylesPromise: Promise<string | null> | undefined;

async function fetchAsset(path: string): Promise<Blob> {
  const response = await fetch(new URL(`assets/katex/${path}`, document.baseURI));
  if (!response.ok) {
    throw new Error(`Unable to load ${path}`);
  }
  return response.blob();
}

function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// The notebook iframe only allows data: fonts, so KaTeX's fonts are inlined into its stylesheet.
async function loadStyles(): Promise<string> {
  const css = await (await fetchAsset('katex.min.css')).text();
  if (!css.includes('@font-face')) {
    throw new Error('Unexpected KaTeX stylesheet');
  }
  const files = new Set(Array.from(css.matchAll(KATEX_FONT_URL), (match) => match[1]));
  const fonts = new Map(
    await Promise.all(
      Array.from(files, async (file) => {
        const font = new Blob([await fetchAsset(`fonts/${file}`)], {type: 'font/woff2'});
        return [file, await dataUrl(font)] as const;
      }),
    ),
  );
  return css.replace(
    KATEX_FONT_URL,
    (_, file: string) => `url(${fonts.get(file)}) format("woff2")`,
  );
}

export async function loadNotebookMath(): Promise<NotebookMath> {
  stylesPromise ??= loadStyles().catch(() => {
    stylesPromise = undefined;
    return null;
  });
  const styles = await stylesPromise;
  return {
    styles,
    render: (tex, displayMode) =>
      katex.renderToString(tex, {
        displayMode,
        // Without KaTeX's stylesheet, fall back to the browser's native MathML rendering.
        output: styles ? 'htmlAndMathml' : 'mathml',
        throwOnError: false,
        strict: 'ignore',
        trust: false,
        maxSize: 20,
        maxExpand: 1000,
      }),
  };
}
