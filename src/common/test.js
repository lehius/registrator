import { Component } from "./component";

const component = new Component();

export const getComponent = (fn) => {
  if (component.data) {
    fn(component.data);
    return;
  }
  if (component.extra.token) {
    component.me(fn);
    return;
  }
  component.login(fn);
}

export const logout = () => {
  component.logout();
}