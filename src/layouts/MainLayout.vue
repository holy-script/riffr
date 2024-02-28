<template>
	<q-layout>
		<q-page-container>
			<router-view />
		</q-page-container>
		<logout-handler />
	</q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LogoutHandler from 'src/components/LogoutHandler.vue';

export default defineComponent({
	name: 'MainLayout',
	components: { LogoutHandler },
	setup() {
		return {};
	},
});
</script>
