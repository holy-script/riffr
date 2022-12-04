<template>
  <q-btn
    v-if="!store.verified"
    label="Verify Code"
    color="orange"
    @click="verify"
  />
  <h3 v-else>Verified!</h3>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { api } from "src/boot/axios";
import { useStore } from "stores/app";

export default defineComponent({
  name: "EmailVerifier",
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();
    const otpVal = ref("");

    const verify = () => {
      $q.dialog({
        title: "OTP Verification",
        message: "Please input the code sent to your email address",
        dark: true,
        persistent: true,
        cancel: true,
        prompt: {
          filled: true,
          model: otpVal,
          type: "text",
          isValid: (val) => /^[0-9]{6,6}$/.test(val),
        },
      }).onOk((data) => {
        api
          .post("/api/verify", {
            otp: otpVal.value,
          })
          .then((res) => {
            $q.notify(res.data.message);
            store.verify();
          })
          .catch(
            (err) =>
              $q.notify(err.response.data.message) &&
              console.log(err.response.status)
          );
      });
    };

    return {
      store,
      verify,
    };
  },
});
</script>

<style lang="sass">
</style>
