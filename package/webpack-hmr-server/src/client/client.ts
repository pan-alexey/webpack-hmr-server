import { app } from './index';
import { Event } from '../common/types';
import { EVENT_NAME } from '../common/constants';
import { eventAdapter } from './components/event-adapter';

const sendEvent = eventAdapter<Event>(EVENT_NAME);
app({
  sendEvent,
  refresh: () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  },
});
