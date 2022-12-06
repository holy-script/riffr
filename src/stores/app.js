import { defineStore } from "pinia";

export const useStore = defineStore("main", {
	state: () => ({
		loggedIn: false,
		verified: false,
		onboarded: false,
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
		logIn(user) {
			this.loggedIn = true;
			this.verified = user.verified;
			this.onboarded = user.onboarded;
		},
		logOut() {
			this.loggedIn = false;
		},
		verify() {
			this.verified = true;
		},
		onboard() {
			this.onboarded = true;
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
