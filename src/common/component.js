import { Socket } from "./socket";

const url = "ws://192.168.0.72/logic";
const commandHandler = new Map();
export class Component extends Socket {
  constructor() {
    super({ url, commandHandler });
    this.create();
  }
  onOpen(e) {
    super.onOpen(e);
    this.login();
  }
  login(fn) {
    const command = "login";
    const message = {
      command,
      data: { component: "registrator", login: "reg2" },
    };
    commandHandler.set(command, (resp) => {
      if (resp.data) {
        this.extra.token = resp.data.token;
        this.data = resp.data.component;
        if (fn) {
          fn(this.data);
        }
      }
    });
    this.sendToSocket(message);
  }
  logout() {
    const command = "logout";
    commandHandler(command, () => {
      this.component = null;
      delete this.extra.token;
    })
    this.sendToSocket({ command });
  }
  me(fn) {
    const command = "me";
    commandHandler(command, (resp) => {
      this.data = resp.data.component;
      if (fn) {
        fn(this.data);
      }
    })
    this.sendToSocket({ command });
  }
}
