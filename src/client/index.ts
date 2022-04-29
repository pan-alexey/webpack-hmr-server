import { Socket } from './components/scoket';
import moduleReplacement from './components/moduleReplacement';
import { QUERY_PATH, TIMEOUT, GLOBAL_NAME } from '../common/constants';

export const app = async () => {
  const socket = new Socket('ws://' + location.host + `/${QUERY_PATH}`, TIMEOUT);
  socket
    .on('open', async (ws) => {
      (ws as WebSocket).send(JSON.stringify({ action: 'check' }));
      console.log('HMR - connected');
    })
    .on('close', async (reason) => {
      // console.log(`Socket is closed. Reconnect will be attempted in ${TIMEOUT} ms.`, e.reason);
    })
    .on('reconected', async (ws) => {
      (ws as WebSocket).send(JSON.stringify({ action: 'check' }));
      // eslint-disable-next-line no-console
      console.log('HMR - reconnected');
    })
    .on('message', async (message) => {
      try {
        const data = JSON.parse(message as string);
        moduleReplacement(data);
      } catch (error) {
        //
      }
    })
    .connect();
};
