/* eslint-disable filenames/match-regex */
type EventTypes = 'open' | 'close' | 'reconected' | 'message';
type EventCallback = (data: null | string | WebSocket) => Promise<void>;

export class SocketClient {
  private wasConnected = false;
  private ws: WebSocket | undefined;
  private reconnected = true;

  private url: string;
  private timeout: number;
  private timer: NodeJS.Timer | undefined;

  private connectCallbacks: Array<(client: WebSocket) => void> = [];
  private reConnectCallbacks: Array<(client: WebSocket) => void> = [];
  private messageCallbacks: Array<(message: string) => void> = [];
  private closeCallbacks: Array<() => void> = [];
  // private callbacks: {
  //   [name in EventTypes]: Array<EventCallback>;
  // } = {
  //   open: [],
  //   close: [],
  //   reconected: [],
  //   message: [],
  // };

  constructor(url: string, timeout: number) {
    this.url = url;
    this.timeout = timeout;
    this.connect();
  }

  private connect(): void {
    const ws = new WebSocket(this.url);
    ws.onopen = () => {
      const callbacks = this.wasConnected ? this.reConnectCallbacks : this.connectCallbacks;
      callbacks.forEach((callback) => {
        callback(ws);
      });
      this.wasConnected = true;
    };

    ws.onmessage = (e) => {
      this.messageCallbacks.forEach((callback) => {
        callback(e.data.toString());
      });
    };

    ws.onclose = () => {
      if (this.reconnected) {
        this.closeCallbacks.forEach((callback) => {
          callback();
        });
        this.timer = setTimeout(() => {
          this.connect();
        }, this.timeout);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    this.ws = ws;
  }

  public close() {
    this.reconnected = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  public onConnect(callback: (client: WebSocket) => void): SocketClient {
    this.connectCallbacks.push(callback);
    return this;
  }

  public onReConnect(callback: (client: WebSocket) => void): SocketClient {
    this.reConnectCallbacks.push(callback);
    return this;
  }

  public onMessage(callback: (message: string) => void): SocketClient {
    this.messageCallbacks.push(callback);
    return this;
  }

  public onClose(callback: () => void): SocketClient {
    this.closeCallbacks.push(callback);
    return this;
  }
}
