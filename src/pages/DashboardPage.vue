<template>
  <q-page class="flex flex-center column pageBg">
    <h1>Dashboard</h1>
    <div class="text-h4">Follow These Steps to Begin! 👇</div>
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      animated
      class="q-my-lg text-h6"
      id="stepCard"
    >
      <q-step
        :name="1"
        title="Start From the Dashboard"
        icon="settings"
        :done="step > 1"
      >
        Hey, you're already here! Push that button to get started; But don't forget to check out these steps first - they're lifesavers when making an awesome montage!
      </q-step>

      <q-step
        :name="2"
        title="Add Images & Detect Faces"
        icon="create_new_folder"
        :done="step > 2"
      >
        The File button will help you start picking images out: you can also set the max page items from the button below 'Upload'. Feel free to browse through the images, you can add or delete as you wish. For ordering, it is recommended to name them in an alphabetical order and then add them here. Once the machine learning model is ready, click 'Detect' and images without faces, if any, will be removed. Finally, the 'Next' button is enabled and you can proceed to the editor.
      </q-step>

      <q-step
        :name="3"
        title="Choose Faces and Image Configurations"
        icon="wallpaper"
        :done="step > 3"
      >
        Now, you will need to set the correct face on each of the images by clicking 'Next Face'.
        There's an FPS Counter knob that you can set to determined the flip speed of the montage. You'll also have the option to zoom in/out, depending on how much of the source image you'd like to be shown. Lastly, there's three buttons: 'Play' & 'Pause', that'll let you see how it's looking with the current settings, and the 'Publish' button, that moves you on to the next step.
      </q-step>

      <q-step
        :name="4"
        title="Create and download the Montage!"
        icon="video_settings"
      >
        Here, everything is generated automatically, and as soon as the process finishes, congratulations! You will have a video created that you can download to your device.
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn
            @click="$refs.stepper.next()"
            color="primary"
            :label="step === 4 ? 'Finish' : 'Continue'"
          />
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="$refs.stepper.previous()"
            label="Back"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
    <q-btn
      color="pink"
      label="Start a Montage 🤳"
      @click="startPicking"
      size="lg"
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
    const step = ref(1);

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
      step,
    };
  },
});
</script>

<style lang="sass">
#stepCard
	width: 80vw
</style>
