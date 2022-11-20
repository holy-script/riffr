import { defineStore } from "pinia";

export const useStore = defineStore("main", {
	state: () => ({
		loggedIn: false,
		montageName: "",
		fileData: [],
		boxData: [],
		montage: [],
		bg: "",
		fps: 0,
		vidObjUrl: "",
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
		setFiles(imgs, boxes) {
			this.fileData = imgs;
			this.boxData = boxes;
		},
		createMontage(arr) {
			this.montage = arr;
		},
		setBg(color) {
			this.bg = color;
		},
		setFps(fps) {
			this.fps = fps;
		},
		createVid(url) {
			this.vidObjUrl = url;
		},
		clearConfig() {
			this.montageName = "";
			this.share = false;
			this.fileData = [];
			this.boxData = [];
			this.montage = [];
			this.bg = "";
			this.fps = 0;
			this.vidObjUrl = "";
		},
	},
});
