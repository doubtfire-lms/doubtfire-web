import JSZip from 'jszip';

const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const OFFICE_RELATIONSHIP_NAMESPACE =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PACKAGE_RELATIONSHIP_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/relationships';
const HYPERLINK_RELATIONSHIP = `${OFFICE_RELATIONSHIP_NAMESPACE}/hyperlink`;
const HYPERLINK_FIELD = /^\s*HYPERLINK\s+(?:"([^"]+)"|([^\s\\]+))/i;

interface LinkField {
  separateIndex: number;
  endIndex: number;
  resultRuns: Element[];
  target: string;
}

interface FieldBounds {
  instruction: string;
  separateIndex: number;
  endIndex: number;
}

interface RelationshipIds {
  used: Set<string>;
  next: number;
}

function fieldType(run: Element): string | null {
  if (run.namespaceURI !== WORD_NAMESPACE || run.localName !== 'r') {
    return null;
  }
  return (
    run
      .getElementsByTagNameNS(WORD_NAMESPACE, 'fldChar')[0]
      ?.getAttributeNS(WORD_NAMESPACE, 'fldCharType') ?? null
  );
}

function hyperlinkTarget(instruction: string): string | null {
  const match = HYPERLINK_FIELD.exec(instruction);
  const target = match?.[1] ?? match?.[2];
  if (!target) {
    return null;
  }
  try {
    const url = new URL(target);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function scanField(children: Element[], startIndex: number): FieldBounds {
  let instruction = '';
  let separateIndex = -1;
  let endIndex = -1;
  let depth = 1;
  for (let cursor = startIndex + 1; cursor < children.length; cursor++) {
    const child = children[cursor];
    const type = fieldType(child);
    if (type === 'begin') {
      depth++;
    } else if (type === 'end') {
      depth--;
      if (depth === 0) {
        endIndex = cursor;
        break;
      }
    } else if (type === 'separate' && depth === 1) {
      separateIndex = cursor;
    }
    if (depth === 1 && separateIndex < 0) {
      instruction += Array.from(child.getElementsByTagNameNS(WORD_NAMESPACE, 'instrText'))
        .map((text) => text.textContent ?? '')
        .join('');
    }
  }

  return {instruction, separateIndex, endIndex};
}

function findLinkField(children: Element[], startIndex: number): LinkField | null {
  const {instruction, separateIndex, endIndex} = scanField(children, startIndex);
  if (separateIndex < 0 || endIndex < 0) {
    return null;
  }
  const target = hyperlinkTarget(instruction);
  const resultRuns = children.slice(separateIndex + 1, endIndex);
  if (
    !target ||
    resultRuns.length === 0 ||
    resultRuns.some((run) => run.namespaceURI !== WORD_NAMESPACE || run.localName !== 'r')
  ) {
    return null;
  }
  return {separateIndex, endIndex, resultRuns, target};
}

function addRelationship(relationships: Document, target: string, ids: RelationshipIds): string {
  let relationshipId: string;
  do {
    relationshipId = `rIdDocxViewer${ids.next++}`;
  } while (ids.used.has(relationshipId));
  ids.used.add(relationshipId);

  const relationship = relationships.createElementNS(
    PACKAGE_RELATIONSHIP_NAMESPACE,
    'Relationship',
  );
  relationship.setAttribute('Id', relationshipId);
  relationship.setAttribute('Type', HYPERLINK_RELATIONSHIP);
  relationship.setAttribute('Target', target);
  relationship.setAttribute('TargetMode', 'External');
  relationships.documentElement.appendChild(relationship);
  return relationshipId;
}

function replaceFieldWithLink(
  paragraph: Element,
  children: Element[],
  startIndex: number,
  field: LinkField,
  relationshipId: string,
): void {
  const hyperlink = paragraph.ownerDocument.createElementNS(WORD_NAMESPACE, 'w:hyperlink');
  hyperlink.setAttributeNS(OFFICE_RELATIONSHIP_NAMESPACE, 'r:id', relationshipId);
  paragraph.insertBefore(hyperlink, children[startIndex]);
  for (const run of field.resultRuns) {
    hyperlink.appendChild(run);
  }
  for (const child of children.slice(startIndex, field.separateIndex + 1)) {
    child.remove();
  }
  children[field.endIndex].remove();
}

function convertParagraph(
  paragraph: Element,
  relationships: Document,
  ids: RelationshipIds,
): number {
  let converted = 0;
  let index = 0;
  while (index < paragraph.children.length) {
    const children = Array.from(paragraph.children);
    if (fieldType(children[index]) === 'begin') {
      const field = findLinkField(children, index);
      if (field) {
        const relationshipId = addRelationship(relationships, field.target, ids);
        replaceFieldWithLink(paragraph, children, index, field, relationshipId);
        converted++;
      }
    }
    index++;
  }
  return converted;
}

async function parseParts(
  zip: JSZip,
  documentXml: string,
): Promise<{document: Document; relationships: Document} | null> {
  const parser = new DOMParser();
  const document = parser.parseFromString(documentXml, 'application/xml');
  const relationshipPart = zip.file('word/_rels/document.xml.rels');
  const relationshipXml = relationshipPart
    ? await relationshipPart.async('string')
    : `<Relationships xmlns="${PACKAGE_RELATIONSHIP_NAMESPACE}"/>`;
  const relationships = parser.parseFromString(relationshipXml, 'application/xml');
  if (
    document.getElementsByTagName('parsererror').length > 0 ||
    relationships.getElementsByTagName('parsererror').length > 0
  ) {
    return null;
  }
  return {document, relationships};
}

// Some Word documents store links as field-code runs instead of w:hyperlink.
// docx-preview renders their result text but does not turn it into an anchor.
export async function docxWithLegacyHyperlinks(blob: Blob): Promise<Blob> {
  try {
    const zip = await JSZip.loadAsync(blob);
    const documentPart = zip.file('word/document.xml');
    if (!documentPart) {
      return blob;
    }
    const documentXml = await documentPart.async('string');
    if (!/HYPERLINK/i.test(documentXml)) {
      return blob;
    }

    const parts = await parseParts(zip, documentXml);
    if (!parts) {
      return blob;
    }

    const {document, relationships} = parts;
    const ids: RelationshipIds = {
      used: new Set(
        Array.from(relationships.documentElement.children)
          .map((relationship) => relationship.getAttribute('Id'))
          .filter((id): id is string => id !== null),
      ),
      next: 1,
    };
    let converted = 0;
    for (const paragraph of Array.from(document.getElementsByTagNameNS(WORD_NAMESPACE, 'p'))) {
      converted += convertParagraph(paragraph, relationships, ids);
    }

    if (converted === 0) {
      return blob;
    }
    const serializer = new XMLSerializer();
    zip.file('word/document.xml', serializer.serializeToString(document));
    zip.file('word/_rels/document.xml.rels', serializer.serializeToString(relationships));
    return zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  } catch {
    return blob;
  }
}
