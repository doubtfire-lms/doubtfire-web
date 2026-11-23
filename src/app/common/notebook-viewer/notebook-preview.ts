import DOMPurify from 'dompurify';
import * as marked from 'marked';
import type {NotebookMath} from './notebook-math';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as const;
const MAX_IMAGE_BASE64_LENGTH = 20_000_000;

// Same delimiters as Jupyter: $...$, $$...$$ and \begin{env}...\end{env}, never across a blank line.
const MATH_HINT = /\$|\\begin\{/;
const MATH_BODY = String.raw`(?:[^\n]|\n(?![ \t]*\n))+?`;
const DISPLAY_MATH = String.raw`\$\$(${MATH_BODY})\$\$|(\\begin\{([a-z]+\*?)\}${MATH_BODY}\\end\{\3\})`;
const BLOCK_MATH = new RegExp(String.raw`^ {0,3}(?:${DISPLAY_MATH})[ \t]*(?:\n+|$)`, 'i');
const INLINE_MATH = new RegExp(String.raw`^(?:${DISPLAY_MATH}|\$((?:\\[\s\S]|[^\\$])+?)\$)`, 'i');

const FRAME_STYLES = `
  :root { color-scheme: light; font: 14px/1.55 system-ui, sans-serif; color: #1e293b; --gutter: 82px; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; background: #fff; }
  main { max-width: 1100px; margin: 0 auto; padding: 0 var(--gutter); }
  h1, h2, h3, h4 { line-height: 1.3; margin: 1.1em 0 .5em; }
  p { margin: .65em 0; }
  a { color: #1d4ed8; }
  img { max-width: 100%; height: auto; }
  pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; }
  table { border-collapse: collapse; display: block; max-width: 100%; overflow-x: auto; }
  th, td { border: 1px solid #cbd5e1; padding: 5px 9px; text-align: left; }
  blockquote { border-left: 3px solid #cbd5e1; margin-left: 0; padding-left: 14px; color: #475569; }
  .cell { margin: 0 0 16px; }
  .code-cell { display: grid; grid-template-columns: var(--gutter) minmax(0, 1fr); margin-left: calc(-1 * var(--gutter)); }
  .prompt { color: #64748b; font: 13px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace; text-align: right; padding: 10px 10px 0 0; white-space: nowrap; }
  .source { margin: 0; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; }
  .output { min-width: 0; margin-top: 10px; overflow-x: auto; }
  .output > :first-child { margin-top: 0; }
  .output pre { margin: 0; }
  .stderr, .error { color: #b91c1c; }
  .notice { color: #64748b; font-style: italic; }
  .raw-cell { color: #475569; }
  .katex-display { overflow-x: auto; overflow-y: hidden; padding: 2px 0; }
  @media (max-width: 640px) {
    :root { --gutter: 0px; }
    .code-cell { display: block; }
    .prompt { display: none; }
  }
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function notebookText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.every((part) => typeof part === 'string')) {
    return value.join('');
  }
  return '';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function imageData(bundle: unknown): string | null {
  if (!isRecord(bundle)) {
    return null;
  }
  for (const mimeType of IMAGE_TYPES) {
    const base64 = notebookText(bundle[mimeType]).replace(/\s/g, '');
    if (
      base64.length > 0 &&
      base64.length <= MAX_IMAGE_BASE64_LENGTH &&
      /^[A-Za-z0-9+/]*={0,2}$/.test(base64)
    ) {
      return `data:${mimeType};base64,${base64}`;
    }
  }
  return null;
}

function safeInlineImage(src: string): string | null {
  const match = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]*={0,2})$/i.exec(src);
  return match && match[2].length > 0 && match[2].length <= MAX_IMAGE_BASE64_LENGTH
    ? `data:${match[1].toLowerCase()};base64,${match[2]}`
    : null;
}

function mathExtension(
  level: 'block' | 'inline',
  pattern: RegExp,
): marked.TokenizerAndRendererExtension {
  return {
    name: `${level}Math`,
    level,
    start: level === 'inline' ? (src: string) => src.search(MATH_HINT) : undefined,
    tokenizer(src: string) {
      const match = pattern.exec(src);
      if (!match) {
        return undefined;
      }
      return {
        type: `${level}Math`,
        raw: match[0],
        tex: match[1] ?? match[2] ?? match[4],
        displayMode: match[4] === undefined,
      };
    },
    // KaTeX output is swapped in after sanitising, since DOMPurify would strip its markup.
    renderer: (token) =>
      `<span data-notebook-math="${token['displayMode'] ? 'display' : 'inline'}">${escapeHtml(token['tex'])}</span>`,
  };
}

const markdown = new marked.Marked({
  extensions: [mathExtension('block', BLOCK_MATH), mathExtension('inline', INLINE_MATH)],
});

function sanitizeFragment(html: string, attachments?: unknown, math?: NotebookMath): string {
  const clean = DOMPurify.sanitize(html, {
    FORBID_TAGS: [
      'script',
      'style',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'button',
      'textarea',
      'select',
      'svg',
      'math',
      'link',
      'base',
      'meta',
    ],
    FORBID_ATTR: ['style', 'srcset', 'formaction'],
    SANITIZE_NAMED_PROPS: true,
  });
  const template = document.createElement('template');
  template.innerHTML = clean;

  for (const link of template.content.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const href = link.getAttribute('href') ?? '';
    try {
      const url = new URL(href);
      if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
        link.removeAttribute('href');
        continue;
      }
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } catch {
      link.removeAttribute('href');
    }
  }

  for (const image of template.content.querySelectorAll<HTMLImageElement>('img')) {
    const src = image.getAttribute('src') ?? '';
    let safeSrc: string;
    if (src.startsWith('attachment:') && isRecord(attachments)) {
      const attachment = attachments[src.slice('attachment:'.length)];
      safeSrc = imageData(attachment) ?? '';
    } else {
      safeSrc = safeInlineImage(src) ?? '';
    }
    if (safeSrc) {
      image.src = safeSrc;
    } else {
      image.replaceWith(document.createTextNode(image.alt || '[Image omitted]'));
    }
  }

  if (math) {
    for (const placeholder of template.content.querySelectorAll('[data-notebook-math]')) {
      placeholder.outerHTML = math.render(
        placeholder.textContent ?? '',
        placeholder.getAttribute('data-notebook-math') === 'display',
      );
    }
  }
  return template.innerHTML;
}

function markdownHtml(source: string, attachments?: unknown, math?: NotebookMath): string {
  const renderer = new marked.Renderer();
  renderer.image = ({href, text}) => {
    let src = safeInlineImage(href);
    if (href.startsWith('attachment:') && isRecord(attachments)) {
      try {
        src = imageData(attachments[decodeURIComponent(href.slice('attachment:'.length))]);
      } catch {
        src = null;
      }
    }
    return src
      ? `<img src="${src}" alt="${escapeHtml(text)}">`
      : `<span class="notice">${escapeHtml(text || '[Image omitted]')}</span>`;
  };
  const html = markdown.parse(source.replaceAll(/\r\n|\r/g, '\n'), {
    async: false,
    renderer,
  }) as string;
  return sanitizeFragment(html, attachments, math);
}

function outputHtml(output: unknown, math?: NotebookMath): string {
  if (!isRecord(output)) {
    return '';
  }
  if (output['output_type'] === 'stream') {
    const className = output['name'] === 'stderr' ? 'output stderr' : 'output';
    return `<div class="${className}"><pre>${escapeHtml(notebookText(output['text']))}</pre></div>`;
  }
  if (output['output_type'] === 'error') {
    return `<div class="output error"><pre>${escapeHtml(notebookText(output['traceback']))}</pre></div>`;
  }

  const data = output['data'];
  if (!isRecord(data)) {
    return '';
  }
  const image = imageData(data);
  if (image) {
    return `<div class="output"><img alt="Notebook output" src="${image}"></div>`;
  }
  if (data['application/javascript'] || data['text/javascript']) {
    return '<div class="output notice">Interactive JavaScript output omitted.</div>';
  }
  if (data['text/html']) {
    return `<div class="output">${sanitizeFragment(notebookText(data['text/html']))}</div>`;
  }
  if (data['text/markdown']) {
    return `<div class="output">${markdownHtml(notebookText(data['text/markdown']), undefined, math)}</div>`;
  }
  const svg = notebookText(data['image/svg+xml']);
  if (svg && svg.length <= MAX_IMAGE_BASE64_LENGTH) {
    try {
      // Browsers render SVG loaded as an image without scripts or external requests.
      return `<div class="output"><img alt="Notebook output" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}"></div>`;
    } catch {
      return '<div class="output notice">SVG output omitted.</div>';
    }
  }
  if (svg) {
    return '<div class="output notice">SVG output omitted.</div>';
  }
  const latex = notebookText(data['text/latex']);
  if (math && latex) {
    const trimmed = latex.trim();
    if (trimmed.startsWith('\\[') && trimmed.endsWith('\\]')) {
      return `<div class="output">${math.render(trimmed.slice(2, -2), true)}</div>`;
    }
    if (trimmed.startsWith('\\(') && trimmed.endsWith('\\)')) {
      return `<div class="output">${math.render(trimmed.slice(2, -2), false)}</div>`;
    }
    return `<div class="output">${MATH_HINT.test(latex) ? markdownHtml(latex, undefined, math) : math.render(trimmed, true)}</div>`;
  }
  const text = notebookText(data['text/latex'] ?? data['text/plain']);
  if (text) {
    return `<div class="output"><pre>${escapeHtml(text)}</pre></div>`;
  }
  return '<div class="output notice">Unsupported output omitted.</div>';
}

function cellHtml(cell: unknown, math?: NotebookMath): string {
  if (!isRecord(cell)) {
    return '';
  }
  const source = notebookText(cell['source']);
  if (cell['cell_type'] === 'markdown') {
    return `<section class="cell markdown-cell">${markdownHtml(source, cell['attachments'], math)}</section>`;
  }
  if (cell['cell_type'] === 'raw') {
    return `<section class="cell raw-cell"><pre>${escapeHtml(source)}</pre></section>`;
  }
  if (cell['cell_type'] === 'code') {
    const count = Number.isInteger(cell['execution_count']) ? cell['execution_count'] : ' ';
    const outputs = Array.isArray(cell['outputs'])
      ? cell['outputs']
          .map((output) => {
            const html = outputHtml(output, math);
            const isResult = isRecord(output) && output['output_type'] === 'execute_result';
            return html && `<div class="prompt">${isResult ? `Out[${count}]:` : ''}</div>${html}`;
          })
          .join('')
      : '';
    return `<section class="cell code-cell"><div class="prompt">In [${count}]:</div><pre class="source"><code>${escapeHtml(source)}</code></pre>${outputs}</section>`;
  }
  return '';
}

function hasMath(cells: unknown[]): boolean {
  return cells.some((cell) => {
    if (!isRecord(cell)) {
      return false;
    }
    if (cell['cell_type'] === 'markdown') {
      return MATH_HINT.test(notebookText(cell['source']));
    }
    return (
      Array.isArray(cell['outputs']) &&
      cell['outputs'].some(
        (output) =>
          isRecord(output) &&
          isRecord(output['data']) &&
          (notebookText(output['data']['text/latex']).length > 0 ||
            MATH_HINT.test(notebookText(output['data']['text/markdown']))),
      )
    );
  });
}

export async function renderNotebookPreview(notebook: unknown): Promise<string> {
  if (!isRecord(notebook) || notebook['nbformat'] !== 4 || !Array.isArray(notebook['cells'])) {
    throw new Error('Invalid notebook format');
  }
  if (notebook['cells'].length > 2000) {
    throw new Error('Notebook has too many cells to preview');
  }
  // KaTeX is only downloaded for notebooks that look like they contain math.
  const math = hasMath(notebook['cells'])
    ? await import('./notebook-math').then((m) => m.loadNotebookMath()).catch(() => undefined)
    : undefined;
  const cells = notebook['cells'].map((cell) => cellHtml(cell, math)).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; connect-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; frame-src 'none'; form-action 'none'; base-uri 'none'"><style>${FRAME_STYLES}${math?.styles ?? ''}</style></head><body><main>${cells}</main></body></html>`;
}
