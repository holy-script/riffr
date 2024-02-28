<template>
	<q-page-sticky position="top-right" :offset="[10, 10]">
		<div v-if="store.loggedIn" style="position: relative">
			<!-- <q-btn id="logout" @click="confirm"> -->
			<!-- <q-icon
          :name="`img:${logoutIcon}`"
          size="md"
        /> -->
			<!-- </q-btn> -->
			<q-btn
				id="logout"
				@click="confirm"
				color="green-5"
				text-color="white"
				label="Logout"
				icon="logout"
				class="q-ma-md"
			/>
		</div>
	</q-page-sticky>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useStore } from 'stores/app';
import { endSession } from 'boot/appwrite';

export default defineComponent({
	name: 'LogoutHandler',
	setup() {
		const store = useStore();
		const $q = useQuasar();
		const router = useRouter();
		const confirm = () => {
			$q.dialog({
				dark: true,
				title: 'Confirm',
				message: 'Are you sure about logging out?',
				cancel: true,
				persistent: true,
				focus: 'cancel',
			}).onOk(async () => {
				await endSession();
				$q.notify({
					message: 'Logged Out!',
					color: 'dark',
					progress: true,
				});
				store.logOut();
				router.push({
					name: 'Home',
				});
			});
		};
		return {
			store,
			confirm,
		};
	},
});
</script>
