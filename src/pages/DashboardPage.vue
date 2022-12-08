<template>
  <q-page
    class="flex flex-center column pageBg"
    padding
  >
    <div class="txtH2 q-my-xs text-center">Dashboard</div>
    <div class="q-pa-md q-ma-md dashCard">
      <div class="flex justify-evenly row">
        <q-avatar
          rounded
          size="10rem"
          color="green-12"
          class="q-mt-lg q-mb-md"
          id="dashAvt"
        >
          <img
            v-if="svg"
            :src="svg"
          >
        </q-avatar>
        <div class="flex justify-evenly column">
          <div class="q-py-sm txtH5">
            <div :class="`flex justify-around ${$q.platform.is.mobile ? 'column flex-center': 'row'}`">
              <div>{{userName}}, {{userAge}}</div>
              <div>{{createdArr.length}} {{createdArr.length == 1 ? 'Montage' : 'Montages'}}</div>
            </div>
          </div>
          <q-chip
            class="q-pa-md"
            color="pink-11"
          >
            <div :class="`q-py-sm ${$q.platform.is.mobile ? '' : 'text-h6'}`">{{userEmail}}</div>
          </q-chip>
        </div>
      </div>
    </div>
    <div class="text-h4 text-center">Follow These Steps to Begin! 👇</div>
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      animated
      class="q-my-lg text-subtitle2"
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
        The File button will help you start picking images out: you can also set the max page items from the button below 'Upload'. Feel free to browse through the images, you can add or delete as you wish. For ordering, it is recommended to name them in an alphabetical order and then add them here. Toggle between in-browser or on-server ML models and the output extension (.gif or .video) through the 'Options' menu. Once the machine learning model is ready(waiting only required for in-browser), click 'Detect' and images without faces, if any, will be removed. Finally, the 'Next' button is enabled and you can proceed to the editor.
      </q-step>

      <q-step
        :name="3"
        title="Choose Faces and Image Configurations"
        icon="wallpaper"
        :done="step > 3"
      >
        Now, you will need to set the correct face on each of the images by clicking 'Next Face'.
        There's an FPS Counter knob that you can set to determined the flip speed of the montage. You'll also have the option to zoom in/out, depending on how much of the source image you'd like to be shown. Lastly, there's three buttons: 'Play'/'Pause', that'll let you see how it's looking with the current settings, and the 'Publish' button, that moves you on to the next step, and the 'Background' button, that chooses the color of the background. Zoom & FPS tools can be toggled shown/hidden from the button near the top.
      </q-step>

      <q-step
        :name="4"
        title="Create and download the Montage!"
        icon="video_settings"
      >
        Here, everything is generated automatically, and as soon as the process finishes, congratulations! You will have a video/gif created that you can download to your device. Also, there will be an option to download a QR Code that links to the viewership page for this creation, and subsequently a link you can copy to the clipboard.
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
    <div class="text-center q-mt-lg">
      <div class="text-h4">Past Creations 👻</div>
      <div
        v-if="createdArr.length > 0"
        class="text-center flex column justify-evenly"
      >
        <div
          v-for="(item, index) in createdArr"
          :key="index"
          class="q-pa-md q-ma-md dashCard"
        >
          <div class="flex row items-center justify-around">
            <div>Publish ID: <i>{{item}}</i></div>
            <q-btn
              label="Go"
              color="red"
              @click="viewMontage(item)"
            />
          </div>
        </div>
      </div>
      <div v-else>
        <div class="text-center text-h6">No Projects Yet...</div>
      </div>
    </div>
    <AuthHandler />
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useStore } from "stores/app";
import { createAvatar } from "@dicebear/avatars";
import * as bigSmile from "@dicebear/big-smile";
import { api } from "boot/axios";
import AuthHandler from "components/AuthHandler.vue";

export default defineComponent({
  name: "DashboardPage",

  components: {
    AuthHandler,
  },

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();
    const nameVal = ref("");
    const step = ref(1);
    const svg = ref();
    const createdArr = ref([]);
    const userName = ref("");
    const userAge = ref(0);
    const userEmail = ref("");

    onMounted(async () => {
      const dash = await api.get("/api/dash");
      svg.value = createAvatar(bigSmile, dash.data.profile);
      createdArr.value = dash.data.montages;
      userName.value = dash.data.name;
      userAge.value = dash.data.age;
      userEmail.value = dash.data.email;
    });

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

    const viewMontage = (id) => {
      router.push({
        name: "Viewer",
        params: {
          id,
        },
      });
    };

    return {
      startPicking,
      step,
      svg,
      createdArr,
      userName,
      userAge,
      userEmail,
      viewMontage,
    };
  },
});
</script>

<style lang="sass">
#stepCard
	width: 80vw
.dashCard
	backdrop-filter: blur(5px)
	background-color: rgba(255, 255, 255, 1)
	border-radius: 26px
	box-shadow: 35px 35px 68px 0px rgba(145, 192, 255, 0.5), inset -8px -8px 16px 0px rgba(145, 192, 255, 0.6), inset 0px 11px 28px 0px rgb(255, 255, 255)
	width: 70vw
	margin: auto
	margin-top: 2em
	margin-bottom: 2.5em
	body.screen--sm &
		width: 90vw
.txtH2
	font-size: 3em
.txtH5
	font-size: 1.5em
#dashAvt
	border-radius: 50%
</style>
