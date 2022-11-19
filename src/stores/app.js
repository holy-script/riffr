import { defineStore } from "pinia";

export const useStore = defineStore("main", {
	state: () => ({
		loggedIn: false,
		montageName: "",
		share: false,
		fileData: [],
		boxData: [],
	}),
	getters: {},
	actions: {
		logIn() {
			this.loggedIn = true;
		},
		logOut() {
			this.loggedIn = false;
		},
		setName(nm) {
			this.montageName = nm;
		},
		shareMontage(val) {
			this.share = val;
		},
		setFiles(imgs, boxes) {
			this.fileData = imgs;
			this.boxData = boxes;
		},
	},
});
