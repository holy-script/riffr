<template>
  <q-page
    id="viewer"
    class="pageBg"
    padding
  >
    <div class="q-pa-md q-ma-md viewCard flex justify-evenly row">
      <div>
        <q-avatar
          rounded
          size="7rem"
          color="green-12"
          id="viewAvt"
          class="q-mt-lg q-mb-lg"
        >
          <img
            v-if="svg"
            :src="svg"
          >
        </q-avatar>
      </div>
      <div class="flex flex-center column">
        <div class="text-center text-h3">{{ shortName }}</div>
        <div class="text-center text-h6">
          Created {{ timeAgo }}
        </div>
      </div>
    </div>
    <div class="q-pa-md q-ma-md viewCard">
      <div v-if="useVideo != 'undefined'">
        <video
          v-if="useVideo"
          :src="url"
          controls
          autoplay
          loop
          class="viewPlayer"
        ></video>
        <img
          v-else
          :src="url"
          alt="GIF Image"
          class="viewPlayer"
        >
      </div>
    </div>
    <div class="q-pa-md q-ma-md viewCard">
      <div class="text-center text-h6">
        Using {{ count }} Images
      </div>
      <div class="text-center">
        <q-chip>{{ creator }}</q-chip>
      </div>
      <div class="text-center text-h6">
        Made This Montage!
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import { api } from "boot/axios";
import { createAvatar } from "@dicebear/avatars";
import * as bigSmile from "@dicebear/big-smile";

export default defineComponent({
  name: "ViewerPage",

  setup() {
    const router = useRouter();
    const store = useStore();
    const $q = useQuasar();
    const id = router.currentRoute.value.params.id;
    const useVideo = ref();
    const url = ref();
    const svg = ref();
    const creator = ref("");
    const count = ref(0);
    const shortName = ref("");
    const timeAgo = ref("");

    onMounted(async () => {
      api
        .get(`/api/${id}`)
        .then((res) => {
          switch (res.data.ext) {
            case "webm":
              useVideo.value = true;
              break;
            case "gif":
              useVideo.value = false;
              break;
          }
          url.value = res.data.link;
          svg.value = createAvatar(bigSmile, res.data.profile);
          creator.value = res.data.userId;
          count.value = res.data.imageCount;
          shortName.value = res.data.shortName;
          let s = Date.now() - res.data.createdAt;
          let ms = s % 1000;
          s = (s - ms) / 1000;
          let secs = s % 60;
          s = (s - secs) / 60;
          let mins = s % 60;
          let hrs = (s - mins) / 60;
          timeAgo.value = `${hrs} ${hrs == 1 ? "hour" : "hours"}, ${mins} ${
            mins == 1 ? "minute" : "minutes"
          } ago`;
          $q.notify({
            message: res.data.message,
            color: "dark",
            progress: true,
            position: "top",
          });
        })
        .catch((err) => {
          router.push({
            name: "Home",
          });
          $q.notify({
            message: err.response.data.message,
            color: "dark",
            progress: true,
          });
        });
    });

    return {
      useVideo,
      url,
      svg,
      creator,
      count,
      shortName,
      timeAgo,
    };
  },
});
</script>

<style lang="sass">
#compiler
	text-align: center
.viewCard
	backdrop-filter: blur(5px)
	background-color: rgba(255, 255, 255, 1)
	border-radius: 26px
	box-shadow: 35px 35px 68px 0px rgba(145, 192, 255, 0.5), inset -8px -8px 16px 0px rgba(145, 192, 255, 0.6), inset 0px 11px 28px 0px rgb(255, 255, 255)
	width: 70vw
	margin: auto
	margin-top: 2em
	margin-bottom: 2em
	body.screen--sm &
		width: 90vw
.viewPlayer
	width: 100%
	border-radius: 14px
#viewAvt
	border-radius: 50%
</style>
