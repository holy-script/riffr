import { route } from 'quasar/wrappers';
import {
	createMemoryHistory,
	createRouter,
	createWebHashHistory,
	createWebHistory,
} from 'vue-router';

import routes from './routes';

import { useStore } from 'src/stores/app';
import { getSession } from 'src/boot/appwrite';

declare module 'vue-router' {
	interface RouteMeta {
		// is optional
		isAdmin?: boolean;
		// must be declared by every route
		requiresAuth: boolean;
	}
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({ store /*, ssrContext */ }) {
	const createHistory = process.env.SERVER
		? createMemoryHistory
		: process.env.VUE_ROUTER_MODE === 'history'
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

	const appStore = useStore(store);

	Router.beforeEach(async (to, from) => {
		let softNav = true;

		if (!from.name) {
			softNav = false;
			const session = await getSession();
			if (session) appStore.logIn();
		}
		if (to.meta.requiresAuth) {
			if (!appStore.loggedIn) {
				console.log('Not logged in, taking you home...');
				return softNav
					? false
					: {
							name: 'Home',
					  };
			}
		}

		return true;
	});
	return Router;
});
