import JSZip from 'jszip';
import * as monaco from 'monaco-editor';

export type ArchiveFileKind = 'code' | 'image' | 'pdf' | 'text' | 'binary';

export interface ArchiveFileClassification {
  kind: ArchiveFileKind;
  mimeType: string;
  textContent?: string;
  language?: string;
}

export interface ArchiveFileEntry {
  path: string;
  name: string;
  tabLabel: string;
  kind: ArchiveFileKind;
  mimeType: string;
  language?: string;
  textContent?: string;
  originalTextContent?: string;
  data?: Uint8Array;
  blob?: Blob;
  blobUrl?: string;
  dirty: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  zipObject: JSZip.JSZipObject;
}

type ArchiveFileKindLike = Pick<ArchiveFileEntry, 'kind'> | null | undefined;
type ArchiveFilePreviewLike = Pick<ArchiveFileEntry, 'kind' | 'blobUrl'> | null | undefined;

export function isArchiveCodeOrTextFile(file: ArchiveFileKindLike): boolean {
  return file?.kind === 'code' || file?.kind === 'text';
}

export function isArchiveImageFile(file: ArchiveFilePreviewLike): boolean {
  return file?.kind === 'image' && !!file.blobUrl;
}

export function isArchivePdfFile(file: ArchiveFilePreviewLike): boolean {
  return file?.kind === 'pdf' && !!file.blobUrl;
}

export function createArchiveFilePlaceholder(
  path: string,
  zipObject: JSZip.JSZipObject,
): ArchiveFileEntry {
  const name = getBaseName(path);
  return {
    path,
    name,
    tabLabel: name,
    kind: 'binary',
    mimeType: 'application/octet-stream',
    dirty: false,
    isLoaded: false,
    isLoading: false,
    zipObject,
  };
}

export function getOrderedUploadFileIndex(path: string): number | null {
  const fileName = getBaseName(path);
  const match = fileName.match(/^(\d+)-/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function isArchivePathHidden(path: string): boolean {
  const segments = path.split('/').filter((segment) => segment.length > 0);
  return segments.some((segment) => segment.startsWith('.') || segment === '__MACOSX');
}

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  return new Uint8Array(data).buffer;
}

export function createArchiveFileEntry(
  existing: ArchiveFileEntry,
  classification: ArchiveFileClassification,
  data: Uint8Array,
): ArchiveFileEntry {
  const blob = new Blob([toArrayBuffer(data)], {type: classification.mimeType});
  const shouldCreateBlobUrl =
    classification.kind === 'image' ||
    classification.kind === 'pdf' ||
    classification.kind === 'binary';

  return {
    ...existing,
    kind: classification.kind,
    mimeType: classification.mimeType,
    language: classification.language,
    textContent: classification.textContent,
    originalTextContent: classification.textContent,
    data,
    blob,
    blobUrl: shouldCreateBlobUrl ? URL.createObjectURL(blob) : undefined,
    dirty: false,
    isLoaded: true,
    isLoading: false,
  };
}

export function classifyArchiveFile(path: string, data: Uint8Array): ArchiveFileClassification {
  const detectedMimeType = detectMimeType(data);
  if (detectedMimeType === 'application/pdf') {
    return {kind: 'pdf', mimeType: detectedMimeType};
  }

  if (detectedMimeType.startsWith('image/')) {
    return {kind: 'image', mimeType: detectedMimeType};
  }

  if (isProbablyText(data)) {
    const decoded = decodeUtf8(data);
    if (decoded !== null) {
      const language = getMonacoLanguageForPath(path);
      if (language && language !== 'plaintext') {
        return {kind: 'code', mimeType: 'text/plain', textContent: decoded, language};
      }

      return {kind: 'text', mimeType: 'text/plain', textContent: decoded, language: 'plaintext'};
    }
  }

  return {kind: 'binary', mimeType: detectedMimeType || 'application/octet-stream'};
}

export function getMonacoLanguageForPath(path: string): string | undefined {
  const fileName = getBaseName(path).toLowerCase();
  const allLanguages = monaco?.languages?.getLanguages?.() ?? [];

  for (const language of allLanguages) {
    if (language.filenames?.some((f) => f.toLowerCase() === fileName)) {
      return language.id;
    }
    if (language.extensions?.some((ext) => fileName.endsWith(ext.toLowerCase()))) {
      return language.id;
    }
  }

  return undefined;
}

function getBaseName(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
}

function decodeUtf8(data: Uint8Array): string | null {
  try {
    return new TextDecoder('utf-8', {fatal: true}).decode(data);
  } catch {
    return null;
  }
}

function isProbablyText(data: Uint8Array): boolean {
  if (data.length === 0) {
    return true;
  }

  const limit = Math.min(data.length, 8192);
  let suspicious = 0;

  for (let i = 0; i < limit; i++) {
    const byte = data[i];

    if (byte === 0) {
      return false;
    }

    const isPrintableAscii = byte >= 32 && byte <= 126;
    const isAllowedControl = byte === 9 || byte === 10 || byte === 13;
    const isUtf8Extended = byte >= 128;

    if (!isPrintableAscii && !isAllowedControl && !isUtf8Extended) {
      suspicious++;
    }
  }

  return suspicious / limit < 0.02;
}

function detectMimeType(data: Uint8Array): string {
  if (startsWithBytes(data, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return 'application/pdf';
  }
  if (startsWithBytes(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }
  if (startsWithBytes(data, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }
  if (startsWithString(data, 'GIF87a') || startsWithString(data, 'GIF89a')) {
    return 'image/gif';
  }
  if (startsWithString(data, 'BM')) {
    return 'image/bmp';
  }
  if (
    startsWithString(data, 'RIFF') &&
    data.length >= 12 &&
    String.fromCharCode(...Array.from(data.slice(8, 12))) === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (isSvg(data)) {
    return 'image/svg+xml';
  }

  return 'application/octet-stream';
}

function isSvg(data: Uint8Array): boolean {
  const decoded = decodeUtf8(data.slice(0, 4096));
  if (!decoded) {
    return false;
  }

  const trimmed = decoded.trim().toLowerCase();
  return trimmed.includes('<svg') && trimmed.includes('</svg>');
}

function startsWithBytes(data: Uint8Array, signature: number[]): boolean {
  if (data.length < signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (data[i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

function startsWithString(data: Uint8Array, signature: string): boolean {
  if (data.length < signature.length) {
    return false;
  }
  for (let i = 0; i < signature.length; i++) {
    if (data[i] !== signature.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}
