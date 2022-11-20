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
					requiresAuth: false,
				},
				component: () => import("pages/DashboardPage.vue"),
			},
			{
				name: "Picker",
				path: "pick",
				meta: {
					requiresAuth: false,
				},
				component: () => import("pages/PickerPage.vue"),
			},
			{
				name: "Editor",
				path: "edit",
				meta: {
					requiresAuth: false,
				},
				component: () => import("pages/EditorPage.vue"),
			},
			{
				name: "Compiler",
				path: "compile",
				meta: {
					requiresAuth: false,
				},
				component: () => import("pages/CompilerPage.vue"),
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
