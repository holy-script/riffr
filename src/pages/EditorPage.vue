<template>
  <q-page id="editor">
    <div
      v-touch-swipe.mouse="handleSwipe"
      id="montageContainer"
    >
      <canvas id="canvas"></canvas>
      <div
        v-show="showBox"
        id="box"
      ></div>
      <q-bar class="bar bg-teal">
        <q-icon name="laptop_chromebook" />
        <div>Riffr</div>

        <q-space />

        <div class="text-center q-mr-md">
          Editor
        </div>

        <q-space />

        <q-btn
          dense
          flat
          icon="close"
          @click="dash"
        />
      </q-bar>
    </div>
    <q-page-sticky
      v-if="multiple && !hidden && !isPlaying"
      position="right"
      :offset="[10, 0]"
    >
      <div class="flex column items-center">
        <q-btn
          color="yellow-8"
          text-color="black"
          @click="nextFace"
          push
        >Next<br>Face</q-btn>
      </div>
    </q-page-sticky>
    <q-page-sticky
      :position="`${$q.platform.is.mobile?'top-left':'left'}`"
      :offset="[18, 18]"
      v-show="!isPlaying && !hidden"
    >
      <div class="q-pa-md q-ma-md scalerCard flex column items-center">
        <q-slider
          v-model="scaler"
          @change="changeScale"
          :min="10"
          :markers="5"
          :step="5"
          :max="50"
          color="light-green-13"
          label-text-color="black"
          vertical
          reverse
          label-always
          snap
        />
        <q-chip
          :size="`${$q.platform.is.mobile?'xs':''}`"
          icon="center_focus_strong"
        ><strong>Zoom</strong></q-chip>
      </div>
    </q-page-sticky>
    <q-page-sticky
      :position="`${$q.platform.is.mobile ? 'top-right':'bottom-right'}`"
      :offset="[18, 18]"
      v-show="!isPlaying && !hidden"
    >
      <div class="q-pa-md q-ma-md fpsCard flex column items-center">
        <q-knob
          show-value
          v-model="frameRate"
          :size="`${$q.platform.is.mobile?'3.5rem':'5rem'}`"
          :thickness="0.2"
          color="cyan-7"
          center-color="pink-2"
          track-color="cyan-3"
          :min="4"
          :max="10"
          class="q-mb-sm"
        >
          {{ frameRate }}
        </q-knob>
        <q-chip
          :size="`${$q.platform.is.mobile?'xs': ''}`"
          icon="shutter_speed"
        ><strong>FPS</strong></q-chip>
      </div>
    </q-page-sticky>
    <q-page-sticky
      position="bottom"
      :offset="[0, 36]"
    >
      <q-btn
        icon="arrow_circle_left"
        color="teal-5"
        @click="prevFrame"
      >
        <q-tooltip class="text-center">Previous<br>Image</q-tooltip>
      </q-btn>
      <q-fab
        v-model="previewBtn"
        label="Controls"
        label-position="bottom"
        external-label
        vertical-actions-align="left"
        color="purple-13"
        icon="keyboard_arrow_up"
        direction="up"
        square
        class="q-mx-md"
      >
        <q-fab-action
          square
          external-label
          color="amber-5"
          @click="showColor = true"
          icon="palette"
          label="Background"
        />
        <q-fab-action
          square
          external-label
          color="deep-orange-5"
          @click="previewPublish"
          icon="polyline"
          label="Publish"
        />
        <q-fab-action
          v-if="isPlaying"
          square
          external-label
          color="orange"
          @click="previewPause"
          icon="pause_circle"
          label="Pause"
        />
        <q-fab-action
          v-else
          square
          external-label
          color="orange"
          @click="previewPlay"
          icon="play_circle_filled"
          label="Play"
        />
      </q-fab>
      <q-btn
        icon="arrow_circle_right"
        color="teal-5"
        @click="nextFrame"
      >
        <q-tooltip class="text-center">Next<br>Image</q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-page-sticky
      position="top"
      :offset="[0, 40]"
    >
      <q-btn
        color="blue"
        :icon="hidden ? `visibility` : `visibility_off`"
        @click="hidden = !hidden"
      >
        <q-tooltip class="text-center">{{hidden? 'Show Tools': 'Hide Tools'}}</q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-dialog
      v-model="showColor"
      seamless
    >
      <q-card>
        <q-card-section class="column items-center no-wrap">
          <ColorPicker
            theme="dark"
            :color="bg"
            :sucker-hide="true"
            @changeColor="changeColor"
            id="colorPicker"
          />
          <q-btn
            class="q-mt-md"
            label="Close"
            color="red-7"
            @click="showColor = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="loading"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        class="bg-teal text-white"
        style="width: 300px"
      >
        <q-card-section>
          <div class="text-center text-h6">Editor Loader</div>
        </q-card-section>

        <q-card-section class="q-pt-none text-center">
          <q-spinner-gears
            size="xl"
            color="black"
          />
          <br>
          <br>
          <span>Setting things up...</span>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
} from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import gsap from "gsap";
import { useWebWorker } from "@vueuse/core";
import { ColorPicker } from "vue-color-kit";
import "vue-color-kit/dist/vue-color-kit.css";

export default defineComponent({
  name: "EditorPage",

  components: {
    ColorPicker,
  },

  setup() {
    const router = useRouter();
    const store = useStore();
    const $q = useQuasar();
    const showBox = ref(true);
    const images = ref(store.fileData);
    const boxes = ref(store.boxData);
    const loadedImgs = [];
    /** @type {CanvasRenderingContext2D} */
    let ctx;
    let index = 0;
    const maxIndex = images.value.length - 1;
    let cmd = null;
    const scaler = ref(25);
    const scale = ref(1);
    const boxWidth = ref(0);
    const boxHeight = ref(0);
    const box = ref();
    const config = ref({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    const bg = ref("#000000");
    const hidden = ref(false);
    const multiple = ref(false);
    const frameRate = ref(7);
    const previewBtn = ref(false);
    const isPlaying = ref(false);
    let delta, now, then, elapsed, started;
    const capture = ref(false);
    const montage = ref([]);
    const marker = ref([]);
    const showColor = ref(false);
    const loading = ref(true);

    const { data, post, terminate } = useWebWorker("./bitmapWorker.js");

    watch(data, () => {
      if (cmd == "seek") {
        loadedImgs[data.value.i] = data.value.res;
        if (data.value.i == 0) {
          multiple.value = boxes.value[0].length > 1;
          draw();
          loading.value = false;
        }
      }
    });

    const unloadWarn = async (evt) => {
      evt.returnValue = true;
    };

    onMounted(() => {
      window.addEventListener("beforeunload", unloadWarn);
      if (store.fileData.length == 0) {
        $q.notify({
          message: "Please upload images first!",
          progress: true,
        });
        router.push({
          name: "Picker",
        });
      } else {
        /** @type {HTMLCanvasElement}*/
        const canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext("2d", {
          willReadFrequently: true,
        });
        cmd = "init";
        post({
          cmd,
          images: [...images.value],
        });
        cmd = "seek";
        for (let i in images.value) {
          fetchImage(i);
        }
      }
    });

    onBeforeUnmount(async () => {
      window.removeEventListener("beforeunload", unloadWarn);
    });

    const nextFace = () => {
      boxes.value[index].push(boxes.value[index].shift());
      draw();
    };

    const draw = () => {
      box.value = boxes.value[index][0].alignedRect.box;
      changeBoxDims();
      config.value = getImgConfig.value;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = bg.value;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(
        loadedImgs[index],
        config.value.x,
        config.value.y,
        config.value.width,
        config.value.height
      );
    };

    const getBoxConfig = computed(() => {
      return {
        left: window.innerWidth / 2 - boxWidth.value / 2,
        top: window.innerHeight / 2 - boxHeight.value / 2,
        width: boxWidth.value,
        height: boxHeight.value,
        opacity: 1,
        duration: 0.2,
      };
    });

    const getImgConfig = computed(() => {
      return {
        x:
          window.innerWidth / 2 -
          box.value.left * scale.value -
          boxWidth.value / 2,
        y:
          window.innerHeight / 2 -
          box.value.top * scale.value -
          boxHeight.value / 2,
        width: loadedImgs[index].width * scale.value,
        height: loadedImgs[index].height * scale.value,
      };
    });

    const changeBoxDims = () => {
      boxWidth.value = window.innerWidth * (scaler.value / 100);
      scale.value = boxWidth.value / box.value.width;
      boxHeight.value = scale.value * box.value.height;
      gsap.to("#box", getBoxConfig.value);
    };

    const fetchImage = async (i) => {
      if (!marker.value[i]) {
        post({
          cmd,
          i,
        });
        marker.value[i] = true;
      } else {
        multiple.value = boxes.value[i].length > 1;
        draw();
      }
    };

    const nextFrame = () => {
      index++;
      if (index > maxIndex) index = 0;
      fetchImage(index);
    };

    const prevFrame = () => {
      index--;
      if (index < 0) index = maxIndex;
      fetchImage(index);
    };

    const handleSwipe = async ({ evt, ...touch }) => {
      switch (touch.direction) {
        case "left":
          nextFrame();
          break;
        case "right":
          prevFrame();
          break;
        case "up":
          hidden.value = false;
          break;
        case "down":
          hidden.value = true;
          break;
      }
    };

    const dash = () => {
      let tip = $q.notify({
        message:
          "Please use these controls instead of using the browser's forward and backward buttons",
        color: "dark",
        timeout: 0,
      });
      $q.dialog({
        title: "Discard Progress",
        message:
          "Are you sure you want to end project? Your configuration will not be saved.",
        dark: true,
        persistent: true,
        cancel: true,
      })
        .onOk(() => {
          router.push({
            name: "Dashboard",
          });
          store.clearConfig();
        })
        .onDismiss(() => {
          tip();
        });
    };

    const changeScale = (val) => {
      scaler.value = val;
      draw();
    };

    const playing = () => {
      if (!isPlaying.value) {
        return;
      }

      requestAnimationFrame(playing);

      now = window.performance.now();
      elapsed = now - then;

      if (elapsed > delta) {
        then = now - (elapsed % delta);
        if (images.value.length > 1) {
          if (capture.value) {
            montage.value.push({
              img: loadedImgs[index],
              config: getImgConfig.value,
            });
            if (index == maxIndex) {
              previewPause();
              showBox.value = false;
              store.createMontage(montage.value);
              store.setBg(bg.value);
              store.setFps(frameRate.value);
              terminate();
              router.push({
                name: "Compiler",
              });
            }
          }
          nextFrame();
        }
      }
    };

    const previewPlay = () => {
      isPlaying.value = true;
      if (!started) {
        delta = 1000 / frameRate.value;
        then = window.performance.now();
        started = true;
        showBox.value = false;
        playing();
      }
    };

    const previewPause = () => {
      isPlaying.value = false;
      showBox.value = true;
      started = false;
    };

    const previewPublish = () => {
      if (isPlaying.value) {
        previewPause();
      }
      $q.dialog({
        title: "Create Montage",
        message:
          "Please make sure all your images are aligned correctly. Proceed to publishing the montage?",
        cancel: true,
        dark: true,
      })
        .onOk(() => {
          capture.value = true;
          index = 0;
          draw();
          previewPlay();
        })
        .onCancel(() => {
          $q.notify("Feel free to keep working...");
        });
    };

    const changeColor = (obj) => {
      bg.value = obj.hex;
      draw();
    };

    return {
      showBox,
      handleSwipe,
      dash,
      multiple,
      hidden,
      nextFace,
      changeScale,
      scaler,
      frameRate,
      previewBtn,
      previewPlay,
      previewPause,
      previewPublish,
      isPlaying,
      store,
      nextFrame,
      prevFrame,
      bg,
      changeColor,
      showColor,
      loading,
    };
  },
});
</script>

<style lang="sass">
#box
	position: absolute
	top: 100px
	left: 100px
	width: 100px
	height: 100px
	border: 3px solid purple
	z-index: 100
#montageContainer
	position: relative
	canvas
		position: absolute
.bar
	position: absolute
	width: 100%
	z-index: 10
#editor
	overflow: hidden
#colorPicker
	width: 14rem !important
.fpsCard
	position: relative
	backdrop-filter: blur(5px)
	background-color: rgba(255, 255, 255, 1)
	border-radius: 26px
	box-shadow: -10px 10px 68px 0px rgba(145, 192, 255, 0.5), inset -8px -8px 16px 0px rgba(145, 192, 255, 0.6), inset 0px 11px 28px 0px rgb(255, 255, 255)
	margin: auto
	margin-top: 2em
	margin-bottom: 2em
.scalerCard
	position: relative
	backdrop-filter: blur(5px)
	background-color: rgba(255, 255, 255, 1)
	border-radius: 26px
	box-shadow: 10px 10px 68px 0px rgba(145, 192, 255, 0.5), inset -8px -8px 16px 0px rgba(145, 192, 255, 0.6), inset 0px 11px 28px 0px rgb(255, 255, 255)
	margin: auto
	margin-top: 2em
	margin-bottom: 2em
</style>
