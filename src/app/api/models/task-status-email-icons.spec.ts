import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {TaskStatus} from './task-status';

// The notification digest email links these PNGs, since mail clients drop icon fonts and SVG.
const EMAIL_ICONS = join(process.cwd(), 'src/assets/images/email');

const missingIcons = (names: string[]) =>
  names.filter((name) => !existsSync(join(EMAIL_ICONS, `${name}.png`)));

describe('Notification email icons', () => {
  it('has a status icon for every task status', () => {
    expect(missingIcons(TaskStatus.STATUS_KEYS.map((status) => `status-${status}`))).toEqual([]);
  });

  it('has an icon for each notification shown without a task', () => {
    const kinds = ['notifications', 'mail', 'insights', 'inbox'];

    expect(missingIcons(kinds.map((kind) => `kind-${kind}`))).toEqual([]);
  });
});
