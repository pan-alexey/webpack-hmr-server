type EventTypes = 'open' | 'close' | 'reconected' | 'message';
type EventCallback = (data?: string | unknown) => Promise<void>;

export class Socket {
  private wasConnected = false;

  private url: string;
  private timeout: number;

  private callbacks: {
    [name in EventTypes]: Array<EventCallback>;
  } = {
    open: [],
    close: [],
    reconected: [],
    message: [],
  };

  constructor(url: string, timeout: number) {
    this.url = url;
    this.timeout = timeout;
  }

  public connect(): void {
    const ws = new WebSocket(this.url);

    ws.onopen = () => {
      const callbacks = this.wasConnected ? this.callbacks.reconected : this.callbacks.open;
      callbacks.forEach((callback) => {
        callback(ws);
      });
      this.wasConnected = true;
    };

    ws.onmessage = (e) => {
      this.callbacks.message.forEach((callback) => {
        callback(e.data);
      });
    };

    ws.onclose = (e) => {
      this.callbacks.close.forEach((callback) => {
        callback(e.reason);
      });
      setTimeout(() => {
        this.connect();
      }, this.timeout);
    };

    ws.onerror = function () {
      ws.close();
    };
  }

  public on(name: EventTypes, callback: EventCallback): Socket {
    this.callbacks[name].push(callback);
    return this;
  }
}
