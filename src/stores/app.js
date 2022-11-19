import { defineStore } from "pinia";

export const useStore = defineStore("main", {
	state: () => ({
		loggedIn: false,
		montageName: "",
		share: false,
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
		shareMontage(val) {
			this.share = val;
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
	},
});
