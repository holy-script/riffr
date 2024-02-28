<template>
	<q-page class="flex flex-center column">
		<h1>Hello, world!</h1>
		<q-btn
			push
			color="white"
			text-color="primary"
			label="Sign In"
			@click="createSession"
		/>
	</q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { createSession } from 'boot/appwrite';

export default defineComponent({
	name: 'IndexPage',
	setup() {
		return { createSession };
	},
});
</script>
