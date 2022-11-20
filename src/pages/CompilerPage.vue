<template>
  <q-page
    id="compiler"
    class="pageBg"
  >
    <div v-if="compiling">
      <canvas id="compileCanvas"></canvas>
    </div>
    <div v-else>
      <q-bar>
        <q-icon name="laptop_chromebook" />
        <div>Riffr - Compiler</div>

        <q-space />

        <div class="text-center q-mr-lg">
          {{ store.montageName }}
        </div>

        <q-space />

        <q-btn
          dense
          flat
          icon="close"
          @click="dash"
        />
      </q-bar>
      <h1>Done</h1>
      <video
        id="vid"
        loop
        :src="store.vidObjUrl"
        controls
      ></video>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from "vue";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";

export default defineComponent({
  name: "CompilerPage",

  setup() {
    const router = useRouter();
    const store = useStore();
    const $q = useQuasar();
    const compiling = ref(true);
    const finalImgs = ref(store.montage);
    const count = ref(0);
    let then,
      now,
      elapsed,
      delta,
      ctx,
      canvas,
      started = false,
      capture = false,
      mediaRecorder,
      stream,
      drawStop = false,
      compDial;

    onMounted(() => {
      window.addEventListener("beforeunload", (evt) => {
        evt.returnValue = true;
      });
      if (!store.montage.length > 0) {
        $q.notify("Pick and Edit Images First!");
        router.push({
          name: "Picker",
        });
      } else {
        compDial = $q.dialog({
          title: "Compiling",
          message: "Montage Creation in Progress...",
          dark: true,
          progress: true,
          persistent: true,
          ok: false,
        });
        count.value = finalImgs.value.length;
      }
    });

    watch(count, (val) => {
      if (val == store.montage.length && !started) {
        started = true;
        compileMontage();
      }
      if (val == store.montage.length * 2 + 1) {
        capture = true;
        record(canvas)
          .then((res) => {
            store.createVid(res);
            $q.notify("Success!");
          })
          .catch((err) => console.log(err));
      }
      if (val == store.montage.length * 3) {
        if (mediaRecorder.state === "recording") {
          then = window.performance.now();
          setTimeout(() => {
            drawStop = true;
            mediaRecorder.stop();
          }, 1000 / store.fps);
        }
      }
    });

    const record = (canvas) => {
      let recordedChunks = [];
      return new Promise(function (res, rej) {
        stream = canvas.captureStream(0);
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp8",
          videoBitsPerSecond: 5000000,
        });

        then = window.performance.now();
        mediaRecorder.start();

        mediaRecorder.ondataavailable = function (event) {
          recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = (event) => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          recordedChunks = [];

          const url = URL.createObjectURL(blob);
          res(url);
        };
      });
    };

    const compileMontage = () => {
      canvas = document.getElementById("compileCanvas");
      ctx = canvas.getContext("2d");
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
      ctx.fillStyle = store.bg;
      delta = 1000 / store.fps;
      then = window.performance.now();
      draw();
    };

    const draw = () => {
      if (drawStop) {
        compiling.value = false;
        compDial.hide();
        return;
      }

      requestAnimationFrame(draw);

      now = window.performance.now();
      elapsed = now - then;

      if (elapsed > delta) {
        then = now - (elapsed % delta);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.drawImage(
          finalImgs.value[0].img,
          finalImgs.value[0].config.x,
          finalImgs.value[0].config.y,
          finalImgs.value[0].config.width,
          finalImgs.value[0].config.height
        );
        if (capture) {
          stream.getVideoTracks()[0].requestFrame();
        }
        finalImgs.value.push(finalImgs.value.shift());
        count.value++;
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

    return {
      store,
      compiling,
      dash,
    };
  },
});
</script>

<style lang="sass">
#compiler
	text-align: center
#vid
	width: 90vw
</style>
