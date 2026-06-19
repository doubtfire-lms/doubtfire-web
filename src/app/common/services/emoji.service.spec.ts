import {EmojiSearch} from '@ctrl/ngx-emoji-mart';
import {describe, expect, it} from 'vitest';
import {EmojiService} from './emoji.service';

describe('EmojiService', () => {
  const emojiSearch = {
    emojisList: {
      v: {colons: ':v:', native: '✌️'},
      thumbsup: {colons: ':thumbsup:', native: '👍'},
    },
  } as unknown as EmojiSearch;

  const service = new EmojiService(emojiSearch);

  it('does not convert slash-delimited SharePoint URL path segments to emoji', () => {
    const url = 'https://example.com/:v:/g/abc123';

    expect(service.colonsToNative(url)).toBe(url);
  });

  it('still converts emoji shortcodes in comment text to native emoji', () => {
    expect(service.colonsToNative('Nice work :thumbsup:')).toBe('Nice work 👍');
  });
});
