const routes = [
	{
		path: "/",
		component: () => import("layouts/MainLayout.vue"),
		children: [
			{
				name: "Home",
				path: "",
				meta: {
					requiresAuth: false,
				},
				component: () => import("pages/IndexPage.vue"),
			},
			{
				name: "Dashboard",
				path: "dash",
				meta: {
					requiresAuth: true,
				},
				component: () => import("pages/DashboardPage.vue"),
			},
			{
				name: "Picker",
				path: "pick",
				meta: {
					requiresAuth: true,
				},
				component: () => import("pages/PickerPage.vue"),
			},
		],
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		name: "Error",
		path: "/:catchAll(.*)*",
		meta: {
			requiresAuth: false,
		},
		component: () => import("pages/ErrorNotFound.vue"),
	},
];

export default routes;
