import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
  state: () => ({
    loggedIn: false,
  }),
  getters: {},
  actions: {
    logIn() {
      this.loggedIn = true;
    },
    logOut() {
      this.loggedIn = false;
    },
  },
});
