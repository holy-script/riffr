<template>
  <q-layout>
    <q-page-container>
      <router-view />
    </q-page-container>
    <LogoutHandler />
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import LogoutHandler from "components/LogoutHandler.vue";

export default defineComponent({
  name: "MainLayout",

  components: {
    LogoutHandler,
  },
});
</script>
