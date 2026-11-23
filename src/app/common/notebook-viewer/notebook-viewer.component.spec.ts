import {describe, expect, it, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {classifyArchiveFile} from 'src/app/common/archive-viewer/archive-viewer.helpers';
import {renderNotebookPreview} from './notebook-preview';
import {NotebookViewerComponent} from './notebook-viewer.component';

describe('NotebookViewerComponent security', () => {
  it('classifies notebook JSON containing SVG output as a notebook', () => {
    const source = JSON.stringify({
      nbformat: 4,
      cells: [
        {
          cell_type: 'code',
          outputs: [{data: {'image/svg+xml': '<svg onload="alert(1)"></svg>'}}],
        },
      ],
    });
    const data = new TextEncoder().encode(source);

    const classification = classifyArchiveFile('submission/probe.ipynb', data);
    expect(classification.kind).toBe('notebook');
    expect(classification.textContent).toBe(source);
    expect(classification.language).toBe('json');
  });

  it('renders untrusted notebook content without active markup', async () => {
    const html = await renderNotebookPreview({
      nbformat: 4,
      cells: [
        {
          cell_type: 'markdown',
          source:
            '<script>alert(1)</script><img src="x" onerror="alert(2)">' +
            '[bad](javascript:alert(3)) [good](https://example.org/) ' +
            '![PNG](attachment:figure.png) ![SVG](attachment:probe.svg)',
          attachments: {
            'figure.png': {'image/png': 'iVBORw0KGgo='},
            'probe.svg': {'image/svg+xml': '<svg onload="alert(9)"></svg>'},
          },
        },
        {
          cell_type: 'code',
          source: 'print("hello")',
          outputs: [
            {output_type: 'display_data', data: {'application/javascript': 'alert(4)'}},
            {
              output_type: 'display_data',
              data: {
                'text/html':
                  '<b>Safe text</b><img src="x" onerror="alert(5)"><iframe srcdoc="<script>alert(6)</script>"></iframe>',
              },
            },
            {
              output_type: 'display_data',
              data: {'image/svg+xml': '<svg onload="alert(7)"></svg>'},
            },
            {output_type: 'stream', text: '<img src="x" onerror="alert(8)">'},
          ],
        },
      ],
    });

    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.querySelector('script, iframe, svg, form, object, embed')).toBeNull();
    expect(document.querySelector('[onerror], [onclick]')).toBeNull();
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(document.querySelector('a[href="https://example.org/"]')).toBeTruthy();
    expect(document.querySelector('img[src^="data:image/png;base64,"]')).toBeTruthy();
    expect(document.querySelector('img[src^="data:image/svg+xml"]')).toBeNull();
    expect(document.body.textContent).toContain('Interactive JavaScript output omitted.');
    expect(document.body.textContent).toContain('SVG output omitted.');
    expect(document.body.textContent).toContain('<img src="x" onerror="alert(8)">');
    expect(
      document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content'),
    ).toContain("script-src 'none'");
  });

  it('renders TeX in markdown cells and LaTeX outputs', async () => {
    const html = await renderNotebookPreview({
      nbformat: 4,
      cells: [
        {
          cell_type: 'markdown',
          source: 'Inline $x_1$, display $$\\frac{a}{b}$$ and $\\href{javascript:alert(1)}{y}$',
        },
        {
          cell_type: 'code',
          source: 'P',
          outputs: [
            {
              output_type: 'execute_result',
              data: {'text/latex': '$\\displaystyle P{\\left(t \\right)}$', 'text/plain': 'P(t)'},
            },
          ],
        },
      ],
    });

    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(3);
    expect(document.querySelector('[data-notebook-math], script, a[href]')).toBeNull();
    expect(document.body.textContent).not.toContain('$');
  });

  it('keeps the preview iframe scriptless and isolated', async () => {
    await TestBed.configureTestingModule({
      declarations: [NotebookViewerComponent],
      imports: [MatProgressSpinnerModule, NoopAnimationsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(NotebookViewerComponent);
    fixture.componentRef.setInput(
      'notebookBlob',
      new Blob([JSON.stringify({nbformat: 4, cells: [{cell_type: 'markdown', source: 'Ready'}]})]),
    );
    fixture.detectChanges();

    const frame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    const sandbox = frame.getAttribute('sandbox') ?? '';
    expect(sandbox).toBe('allow-popups allow-popups-to-escape-sandbox');
    expect(sandbox).not.toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-same-origin');
    expect(fixture.componentInstance.isLoading).toBe(true);
    await vi.waitFor(() => expect(frame.srcdoc).toContain('Ready'));
    expect(fixture.componentInstance.isLoading).toBe(true);
    frame.dispatchEvent(new Event('load'));
    expect(fixture.componentInstance.isLoading).toBe(false);
  });
});
