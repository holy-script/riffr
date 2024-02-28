<template>
	<q-page class="flex flex-center column">
		<h1>Hello, world!</h1>
		<q-btn
			push
			color="white"
			text-color="primary"
			:label="store.loggedIn ? 'Signed In' : 'Sign In'"
			@click="startSession"
			:disable="store.loggedIn"
		/>
	</q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { startSession, getSession } from 'boot/appwrite';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useStore } from 'src/stores/app';

export default defineComponent({
	name: 'IndexPage',
	setup() {
		const $q = useQuasar();
		const router = useRouter();
		const store = useStore();

		onMounted(async () => {
			const session = await getSession();
			console.log('session:', session);
			if (session) {
				store.logIn();
				router.push({
					name: 'Dashboard',
				});
			}

			const urlParams = new URLSearchParams(window.location.search);
			const error = urlParams.get('error');

			if (error) {
				$q.notify({
					message: JSON.parse(error).message || 'An error occurred',
					color: 'negative',
					progress: true,
				});
				console.error(JSON.parse(error));
			}
		});

		return { startSession, store };
	},
});
</script>
