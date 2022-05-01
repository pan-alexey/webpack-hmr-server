/* eslint-disable filenames/match-regex */
// import '@testing-library/jest-dom';
import { ModuleEvent } from '../index';

describe('client/client', () => {
  it('dummy', async () => {
    console.log(ModuleEvent);
    const moduleEvent = new ModuleEvent();

    document.addEventListener('_test_', (e) => {
      console.log('_test_', e);
    });

    moduleEvent.dispatch();
    expect(1).toEqual(1);
  });
});
