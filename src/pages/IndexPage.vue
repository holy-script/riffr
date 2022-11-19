<template>
  <q-page class="flex flex-center column">
    <h1>Hello, world!</h1>
    <AuthHandler />
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

import AuthHandler from "components/AuthHandler.vue";

export default defineComponent({
  name: "IndexPage",

  components: {
    AuthHandler,
  },
});
</script>
