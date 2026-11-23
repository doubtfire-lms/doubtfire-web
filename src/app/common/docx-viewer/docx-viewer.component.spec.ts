import JSZip from 'jszip';
import {describe, expect, it, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {sanitizeDocxInlineStyles, sanitizeDocxStyles} from './docx-css-sanitizer';
import {DocxViewerComponent} from './docx-viewer.component';

const relationshipNamespace = 'http://schemas.openxmlformats.org/package/2006/relationships';
const officeRelationshipNamespace =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const wordNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

async function maliciousDocument(): Promise<Blob> {
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    </Types>`,
  );
  zip.file(
    '_rels/.rels',
    `<Relationships xmlns="${relationshipNamespace}">
      <Relationship Id="rIdDoc" Type="${officeRelationshipNamespace}/officeDocument" Target="word/document.xml"/>
    </Relationships>`,
  );
  zip.file(
    'word/_rels/document.xml.rels',
    `<Relationships xmlns="${relationshipNamespace}">
      <Relationship Id="rIdLink" Type="${officeRelationshipNamespace}/hyperlink" Target="javascript:window.__docx_xss=1" TargetMode="External"/>
      <Relationship Id="rIdStyles" Type="${officeRelationshipNamespace}/styles" Target="styles.xml"/>
      <Relationship Id="rIdAlt" Type="${officeRelationshipNamespace}/aFChunk" Target="chunk1.html"/>
    </Relationships>`,
  );
  zip.file(
    'word/document.xml',
    `<w:document xmlns:w="${wordNamespace}" xmlns:r="${officeRelationshipNamespace}">
      <w:body>
        <w:p><w:hyperlink r:id="rIdLink"><w:r><w:t>Click marker</w:t></w:r></w:hyperlink></w:p>
        <w:altChunk r:id="rIdAlt"/>
      </w:body>
    </w:document>`,
  );
  zip.file(
    'word/styles.xml',
    `<w:styles xmlns:w="${wordNamespace}">
      <w:docDefaults><w:rPrDefault><w:rPr>
        <w:rFonts w:ascii="x;}body{display:none;background-image:url(https://example.invalid/probe)}span{font-family:y"/>
      </w:rPr></w:rPrDefault></w:docDefaults>
    </w:styles>`,
  );
  zip.file('word/chunk1.html', '<script>window.parent.__docx_altchunk=1</script>');
  return zip.generateAsync({type: 'blob'});
}

describe('DocxViewerComponent security', () => {
  it('drops resource-loading CSS while preserving ordinary formatting', () => {
    const [css] = sanitizeDocxStyles([
      '.docx { color: red; background-image: url(https://example.invalid/a) }' +
        '@import url(https://example.invalid/b);' +
        '@font-face { font-family: probe; src: url(https://example.invalid/font) }' +
        '.docx p { background-image: image-set("https://example.invalid/c"); ' +
        'font-size: 12pt; cursor: u\\72l(https://example.invalid/d) }',
    ]);
    expect(css).toContain('color: red');
    expect(css).toContain('font-size: 12pt');
    expect(css).not.toContain('example.invalid');
    expect(css).not.toContain('@import');
    expect(css).not.toContain('@font-face');

    const root = document.createElement('div');
    root.innerHTML =
      '<span style="color: red; background-image: url(https://example.invalid/e)">Text</span>';
    sanitizeDocxInlineStyles(root);
    expect(root.querySelector('span')?.getAttribute('style')).toContain('color: red');
    expect(root.querySelector('span')?.getAttribute('style')).not.toContain('example.invalid');
  });

  it('removes active links and HTML while containing document CSS', async () => {
    await TestBed.configureTestingModule({
      declarations: [DocxViewerComponent],
      imports: [
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DocxViewerComponent);
    fixture.componentRef.setInput('documentBlob', await maliciousDocument());
    fixture.detectChanges();

    await vi.waitFor(() => {
      fixture.detectChanges();
      const host = fixture.nativeElement.querySelector(
        '.docx-preview-container > div',
      ) as HTMLElement;
      const root = host.shadowRoot;
      expect(root?.querySelector('a')).toBeTruthy();
      expect(root?.querySelector('a')?.getAttribute('href')).toBeNull();
      expect(root?.querySelector('iframe')).toBeNull();
      expect(
        [...(root?.querySelectorAll('style') ?? [])].some((style) =>
          /body\s*\{\s*display:\s*none/.test(style.textContent ?? ''),
        ),
      ).toBe(true);
      expect(root?.textContent).not.toContain('example.invalid');
      expect(getComputedStyle(document.body).display).not.toBe('none');
    });
  });
});
