import {describe, expect, it} from 'vitest';
import {MarkedPipe} from './marked.pipe';

describe('MarkedPipe', () => {
  it('create an instance', () => {
    const pipe = new MarkedPipe();
    expect(pipe).toBeTruthy();
  });

  it.each([
    {
      name: 'renders indented code blocks',
      input: '    const x = 1;\n    const y = 2;',
      expected: '<pre><code>const x = 1;\nconst y = 2;\n</code></pre>\n',
    },
    {
      name: 'renders fenced code blocks',
      input: '```\nconst x = 1;\nconst y = 2;\n```',
      expected: '<pre><code>const x = 1;\nconst y = 2;\n</code></pre>\n',
    },
    {
      name: 'renders tables',
      input: '| x | y |\n| --- | --- |\n| 1 | 2 |',
      expected:
        '<table>\n<thead>\n<tr>\n<th>x</th>\n<th>y</th>\n</tr>\n</thead>\n' +
        '<tbody><tr>\n<td>1</td>\n<td>2</td>\n</tr>\n</tbody></table>\n',
    },
    {
      name: 'renders multi-line blockquotes',
      input: '> first line\n> second line',
      expected: '<blockquote>\n<p>first line<br>second line</p>\n</blockquote>\n',
    },
    {
      name: 'renders multi-line lists',
      input: '- one\n- two\n- three',
      expected: '<ul>\n<li>one</li>\n<li>two</li>\n<li>three</li>\n</ul>\n',
    },
    {
      name: 'keeps single newlines within a paragraph as line breaks',
      input: 'first line\nsecond line',
      expected: '<p>first line<br>second line</p>\n',
    },
    {
      name: 'normalises CRLF and CR line endings',
      input: '```\r\nfirst line\rsecond line\r\n```',
      expected: '<pre><code>first line\nsecond line\n</code></pre>\n',
    },
  ])('$name', ({input, expected}) => {
    const pipe = new MarkedPipe();
    expect(pipe.transform(input)).toBe(expected);
  });
});
