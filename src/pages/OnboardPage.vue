<template>
  <q-page>
    <h1>Onboarding</h1>
    <EmailVerifier />
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import EmailVerifier from "components/EmailVerifier.vue";

export default defineComponent({
  name: "LogoutHandler",

  components: {
    EmailVerifier,
  },
});
</script>
