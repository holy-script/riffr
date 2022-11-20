<template>
  <q-page class="flex flex-center column pageBg">
    <h1>Dashboard</h1>
    <q-btn
      color="pink"
      label="Start a Montage"
      @click="startPicking"
    />
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useStore } from "stores/app";

export default defineComponent({
  name: "DashboardPage",

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();
    const nameVal = ref("");

    const startPicking = () => {
      let note = $q.notify({
        message: "Please restrict the name to letters only",
        timeout: 0,
        color: "dark",
        position: "bottom",
      });
      $q.dialog({
        dark: true,
        title: "Choose a Name",
        message: "What would you like to call this montage?",
        prompt: {
          filled: true,
          model: nameVal,
          type: "email",
          isValid: (val) => /^[a-zA-Z]{1,20}$/.test(val),
        },
        cancel: true,
        persistent: true,
      })
        .onOk((data) => {
          store.setName(data.trim());
          router.push({
            name: "Picker",
          });
        })
        .onDismiss(() => {
          note();
        });
    };

    return {
      startPicking,
    };
  },
});
</script>
