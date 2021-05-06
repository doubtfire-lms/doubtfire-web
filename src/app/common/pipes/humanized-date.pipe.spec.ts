import { HumanizedDatePipe } from './humanized-date.pipe';

describe('HumanizedDatePipe', () => {
  it('create an instance', () => {
    const pipe = new HumanizedDatePipe();
    expect(pipe).toBeTruthy();
  });
});
