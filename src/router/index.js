import { route } from "quasar/wrappers";
import {
	createRouter,
	createMemoryHistory,
	createWebHistory,
	createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useStore } from "stores/app";
import { getUser } from "boot/appwrite";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({ store }) {
	const appStore = useStore(store);

	const createHistory = process.env.SERVER
		? createMemoryHistory
		: process.env.VUE_ROUTER_MODE === "history"
		? createWebHistory
		: createWebHashHistory;

	const Router = createRouter({
		scrollBehavior: () => ({ left: 0, top: 0 }),
		routes,

		// Leave this as is and make changes in quasar.conf.js instead!
		// quasar.conf.js -> build -> vueRouterMode
		// quasar.conf.js -> build -> publicPath
		history: createHistory(process.env.VUE_ROUTER_BASE),
	});

	Router.beforeEach(async (to, from) => {
		let softNav = true;

		if (!from.name) {
			softNav = false;
			const user = await getUser();
			if (user) appStore.logIn();
		}
		if (to.meta.requiresAuth) {
			if (!appStore.loggedIn) {
				console.log("Not logged in, taking you home...");
				return softNav
					? false
					: {
							name: "Home",
					  };
			}
		}

		return true;
	});

	return Router;
});
