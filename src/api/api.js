const commandHandler = new Map(),
      URL = "ws://192.168.0.72/logic",
      appendData = {};

let socket = null;

const createSocket = () => {
  socket = new WebSocket(URL);
  
  socket.addEventListener("open", (e) => {
    console.log(`Соединение установлено с ${URL}`);
  });

  socket.addEventListener("message", (e) => {
    const resp = JSON.parse(e.data);
    if (resp.error) {
      console.warn(`error from server: ${JSON.stringify(error)}`);
    }
    const handlers = commandHandler.get(resp.command) || [];
    handlers.forEach(hdl => {
      hdl.fn(resp);
  
    });
  });

  socket.addEventListener("close", (e) => {
    socket = null;
    console.log(`Соединение разорвано с ${URL}`);
    createSocket();
  });
}



function sendToWebSocket(message) {
  const stringyfiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringyfiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringyfiedMessage);
    },
    {once: true}
  );
}



const sendToSocket = (data) => {
  socket.send(data)
}


export const subscribeToCommand = (command, cb) => {
  const subscribers = commandHandler.get(command) || [];
  const cbs = [...subscribers, cb]
  commandHandler.set(command, cbs);
  return () => {
    const subscribers = commandHandler.get(command) || [];
    const cbs = subscribers.filter(subscriber => subscriber !== cb);
    if (cbs.length > 0) {
      commandHandler.set(command, cbs);
      return;
    }
    commandHandler.delete(command);
  }
}