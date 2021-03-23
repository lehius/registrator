const commandHandlers = new Map();
const eventHandlers = new Map();

let ws = null;

const URL = "ws://localhost/logic",
  reconnectTimeout = 1500;

const openHandler = () => {
  console.log(`Соединение установлено с ${URL}`);
};
const closeHandler = e => {
  if (e.wasClean) {
    console.log(`Соединение с ${URL} закрыто чисто`);
  } else {
    console.warn(`Обрыв соединения\n\tКод: ${e.code}, причина: ${e.reason}`);
    setTimeout(createSocket(), reconnectTimeout);
  }
};
const errorHandler = e => {
  console.warn(`Ошибка соединения ${e}`);
};
const messageHandler = e => {
  const resp = JSON.parse(e.data);
  console.dir(resp);
  if (resp.error) {
    console.warn(`error from server: ${JSON.stringify(error)}`);
  }
  const handlers = commandHandlers.get(resp.command) || [];
  handlers.forEach(hdl => {
    hdl.fn(resp);
  });
};

function createSocket(opts) {
  if (ws) {
    ws.removeEventListener("open", openHandler);
    ws.removeEventListener("close", closeHandler);
    ws.removeEventListener("error", errorHandler);
    ws.removeEventListener("message", messageHandler);
    ws.close();
  }
  anotherOpenHandler = opts?.anotherOpenHandler || null;
  ws = new WebSocket(URL);
  ws.addEventListener("open", openHandler);
  ws.addEventListener("close", closeHandler);
  ws.addEventListener("error", errorHandler);
  ws.addEventListener("message", messageHandler);
}

const isOpened = () => ws && ws.readyState === WebSocket.OPEN;

export const socket = {
  reconnect() {
    createSocket()
  },
  isOpened,
  onEvent(type, handler) {
    eventHandlers.get()
  },
  on(command, handler) {
    const handlers = commandHandlers.get(command) || [];
    commandHandlers.set(command, [...handlers, handler]);
    return this.off.bind(null, command, handler);
  },
  off(command, handler) {
    if (!handler) {
      commandHandlers.delete(command);
      return;
    }
    const handlers = commandHandlers.get(command) || [];
    if (!handlers) {
      return;
    }
    const handlersFiltered = handlers.filter(hdlr => hdlr !== handler);
    if (handlersFiltered.length === 0) {
      commandHandlers.delete(command);
    }
  },
  send(message) {
    const stringyfiedMessage = JSON.stringify(message);
    if (isOpened) {
      ws.send(stringyfiedMessage);
      return;
    }
    ws.addEventListener(
      "open",
      () => {
        ws.send(message);
      },
      { once: true }
    );
  }
};
