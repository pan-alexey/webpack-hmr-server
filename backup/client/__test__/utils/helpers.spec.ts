/* eslint-disable filenames/match-regex */
import { unique, formatErrStack } from '../../utils/helpers';

describe('utils/helpers', () => {
  it('uniq', async () => {
    expect(unique([1, 2, 1, '1'])).toEqual(['1', '2']);
  });

  it('formatErrStack', async () => {
    try {
      class ErrOnlyMessage {
        public message = '_ErrOnlyMessage_';
      }
      throw new ErrOnlyMessage();
    } catch (error) {
      expect(formatErrStack(error as Error)).toBe('_ErrOnlyMessage_');
    }

    try {
      class ErrUniqMessage {
        public message = '_ErrOnlyMessage_';
        public stack = '_Stack:ErrOnlyMessage_';
      }
      throw new ErrUniqMessage();
    } catch (error) {
      expect(formatErrStack(error as Error)).toBe('_ErrOnlyMessage_\n_Stack:ErrOnlyMessage_');
    }

    try {
      class ErrStackMessage {
        public message = '_ErrOnlyMessage_';
        public stack = '_ErrOnlyMessage_ _Stack:ErrOnlyMessage_';
      }
      throw new ErrStackMessage();
    } catch (error) {
      expect(formatErrStack(error as Error)).toBe('_ErrOnlyMessage_ _Stack:ErrOnlyMessage_');
    }
  });
});

// export const formatErrStack = function (err: Error) {
//   const message = err.message;
//   const stack = err.stack;
//   if (!stack) {
//     return message;
//   } else if (stack.indexOf(message) < 0) {
//     return message + '\n' + stack;
//   } else {
//     return stack;
//   }
// };
