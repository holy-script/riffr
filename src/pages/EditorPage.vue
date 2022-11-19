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
        <div>Riffr - Editor</div>

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
      v-if="multiple && !hidden"
      position="right"
      :offset="[10, 0]"
    >
      <div class="flex column items-center">
        <q-btn
          color="yellow"
          label="Next Face"
          @click="nextFace"
        />
      </div>
    </q-page-sticky>
    <q-page-sticky
      position="left"
      :offset="[18, 18]"
      v-show="!hidden"
    >
      <div class="flex column items-center">
        <q-slider
          v-model="scaler"
          @change="changeScale"
          :min="10"
          :markers="5"
          :step="5"
          :max="50"
          color="green"
          vertical
          reverse
          label-always
          snap
        />
        <q-chip icon="center_focus_strong">Zoom</q-chip>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import gsap from "gsap";
import { useWebWorker } from "@vueuse/core";

export default defineComponent({
  name: "EditorPage",

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
    const bg = ref("#fae");
    const hidden = ref(false);
    const multiple = ref(false);

    const { data, post, terminate } = useWebWorker("./bitmapWorker.js");

    watch(data, () => {
      if (cmd == "seek") {
        loadedImgs[index] = data.value;
        multiple.value = boxes.value[index].length > 1;
        draw();
      }
      if (cmd == "init") {
        cmd = "seek";
        post({
          cmd,
          index,
        });
      }
    });

    onMounted(() => {
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

    const fetchImage = () => {
      if (typeof loadedImgs[index] != "object")
        post({
          cmd,
          index,
        });
      else {
        multiple.value = boxes.value[index].length > 1;
        draw();
      }
    };

    const nextFrame = () => {
      index++;
      if (index > maxIndex) index = 0;
      fetchImage();
    };

    const prevFrame = () => {
      index--;
      if (index < 0) index = maxIndex;
      fetchImage();
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
        })
        .onDismiss(() => {
          tip();
        });
    };

    const changeScale = (val) => {
      scaler.value = val;
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
</style>
