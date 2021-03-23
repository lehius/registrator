export class Socket {
  constructor(opts) {
    this.url = opts.url;
    this.commandHandler = opts.commandHandler;
    this.reconnect = opts.reconnect || 1500;
    this.extra = opts.extra || {};
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
  }
  create() {
    console.log(`Подключение к ${this.url}`);
    if (this.socket) {
      this.socket = null;
    }
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", this.onOpen);

    this.socket.addEventListener("message", this.onMessage);

    this.socket.addEventListener("close", this.onClose);
  }
  onOpen(e) {
    console.log(`Соединение установлено с ${this.url}`);
  }
  onMessage(e) {
    const resp = JSON.parse(e.data);
    console.dir(resp);
    if (resp.error) {
      console.warn(`error from server: ${JSON.stringify(error)}`);
    }
    const handlers = this.commandHandler.get(resp.command) || [];
    handlers.forEach(hdl => {
      hdl.fn(resp);
    });
  }
  onClose(e) {
    if (e.wasClean) {
      console.log(`Соединение с ${URL} закрыто чисто`);
    } else {
      console.warn(`Обрыв соединения\n\tКод: ${e.code}, причина: ${e.reason}`);
      setTimeout(this.create.bind(), this.reconnect);
    }
  }

  sendToSocket(message) {
    const messageWithExtra = Object.assign({}, this.extra, message);
    const stringyfiedMessage = JSON.stringify(messageWithExtra);

    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(stringyfiedMessage);
      return;
    }
    this.socket.addEventListener(
      "open",
      () => {
        socket.send(stringyfiedMessage);
      },
      { once: true }
    );
  }
}
