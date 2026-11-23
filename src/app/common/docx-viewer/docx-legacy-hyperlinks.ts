import JSZip from 'jszip';

const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const OFFICE_RELATIONSHIP_NAMESPACE =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PACKAGE_RELATIONSHIP_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/relationships';
const HYPERLINK_RELATIONSHIP = `${OFFICE_RELATIONSHIP_NAMESPACE}/hyperlink`;

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
  const match = instruction.match(/^\s*HYPERLINK\s+(?:"([^"]+)"|([^\s\\]+))/i);
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

    const parser = new DOMParser();
    const document = parser.parseFromString(documentXml, 'application/xml');
    const relationshipPath = 'word/_rels/document.xml.rels';
    const relationshipPart = zip.file(relationshipPath);
    const relationshipXml = relationshipPart
      ? await relationshipPart.async('string')
      : `<Relationships xmlns="${PACKAGE_RELATIONSHIP_NAMESPACE}"/>`;
    const relationships = parser.parseFromString(relationshipXml, 'application/xml');
    if (
      document.getElementsByTagName('parsererror').length > 0 ||
      relationships.getElementsByTagName('parsererror').length > 0
    ) {
      return blob;
    }

    const usedIds = new Set(
      Array.from(relationships.documentElement.children).map((relationship) =>
        relationship.getAttribute('Id'),
      ),
    );
    let nextId = 1;
    let converted = 0;
    for (const paragraph of Array.from(document.getElementsByTagNameNS(WORD_NAMESPACE, 'p'))) {
      let index = 0;
      while (index < paragraph.children.length) {
        const children = Array.from(paragraph.children);
        if (fieldType(children[index]) !== 'begin') {
          index++;
          continue;
        }

        let instruction = '';
        let separateIndex = -1;
        let endIndex = -1;
        let depth = 1;
        for (let cursor = index + 1; cursor < children.length; cursor++) {
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
            for (const text of Array.from(
              child.getElementsByTagNameNS(WORD_NAMESPACE, 'instrText'),
            )) {
              instruction += text.textContent ?? '';
            }
          }
        }

        const target = hyperlinkTarget(instruction);
        const resultRuns = children.slice(separateIndex + 1, endIndex);
        if (
          separateIndex < 0 ||
          endIndex < 0 ||
          !target ||
          resultRuns.length === 0 ||
          resultRuns.some((run) => run.namespaceURI !== WORD_NAMESPACE || run.localName !== 'r')
        ) {
          index++;
          continue;
        }

        let relationshipId: string;
        do {
          relationshipId = `rIdDocxViewer${nextId++}`;
        } while (usedIds.has(relationshipId));
        usedIds.add(relationshipId);

        const relationship = relationships.createElementNS(
          PACKAGE_RELATIONSHIP_NAMESPACE,
          'Relationship',
        );
        relationship.setAttribute('Id', relationshipId);
        relationship.setAttribute('Type', HYPERLINK_RELATIONSHIP);
        relationship.setAttribute('Target', target);
        relationship.setAttribute('TargetMode', 'External');
        relationships.documentElement.appendChild(relationship);

        const hyperlink = document.createElementNS(WORD_NAMESPACE, 'w:hyperlink');
        hyperlink.setAttributeNS(OFFICE_RELATIONSHIP_NAMESPACE, 'r:id', relationshipId);
        paragraph.insertBefore(hyperlink, children[index]);
        for (const run of resultRuns) {
          hyperlink.appendChild(run);
        }
        for (const child of children.slice(index, separateIndex + 1)) {
          child.remove();
        }
        children[endIndex].remove();
        converted++;
        index++;
      }
    }

    if (converted === 0) {
      return blob;
    }
    const serializer = new XMLSerializer();
    zip.file('word/document.xml', serializer.serializeToString(document));
    zip.file(relationshipPath, serializer.serializeToString(relationships));
    return zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  } catch {
    return blob;
  }
}
