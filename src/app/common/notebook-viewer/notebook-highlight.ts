import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import julia from 'highlight.js/lib/languages/julia';
import matlab from 'highlight.js/lib/languages/matlab';

export type NotebookHighlighter = (source: string) => string | null;

const MAX_HIGHLIGHT_CHARS = 100_000;
const AUTO_DETECT_LANGUAGES = [
  'python',
  'r',
  'julia',
  'matlab',
  'javascript',
  'typescript',
  'java',
  'cpp',
  'c',
  'csharp',
  'bash',
  'ruby',
];
hljs.registerLanguage('julia', julia);
hljs.registerLanguage('matlab', matlab);

const LANGUAGE_ALIASES: Record<string, string> = {
  ipython: 'python',
  python3: 'python',
  ir: 'r',
  nodejs: 'javascript',
  'c#': 'csharp',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function notebookLanguage(metadata: unknown, sourceSample: string): string | null {
  const languageInfo =
    isRecord(metadata) && isRecord(metadata['language_info']) ? metadata['language_info'] : null;
  const kernelSpec =
    isRecord(metadata) && isRecord(metadata['kernelspec']) ? metadata['kernelspec'] : null;
  let hasLanguageHint = false;

  for (const candidate of [
    languageInfo?.['name'],
    kernelSpec?.['language'],
    kernelSpec?.['name'],
  ]) {
    if (typeof candidate !== 'string') {
      continue;
    }
    const name = candidate.trim().toLowerCase();
    if (!name) {
      continue;
    }
    hasLanguageHint = true;
    const language = LANGUAGE_ALIASES[name] ?? name;
    if (hljs.getLanguage(language)) {
      return language;
    }
  }
  if (hasLanguageHint || !sourceSample.trim()) {
    return null;
  }
  const result = hljs.highlightAuto(
    sourceSample,
    AUTO_DETECT_LANGUAGES.filter((language) => !!hljs.getLanguage(language)),
  );
  return result.relevance >= 3 ? (result.language ?? null) : null;
}

export function createNotebookHighlighter(metadata: unknown, sourceSample = ''): NotebookHighlighter {
  const language = notebookLanguage(metadata, sourceSample);
  return (source) => {
    if (!language || source.length > MAX_HIGHLIGHT_CHARS) {
      return null;
    }
    try {
      const highlighted = hljs.highlight(source, {language, ignoreIllegals: true}).value;
      return DOMPurify.sanitize(highlighted, {ALLOWED_TAGS: ['span'], ALLOWED_ATTR: ['class']});
    } catch {
      return null;
    }
  };
}
