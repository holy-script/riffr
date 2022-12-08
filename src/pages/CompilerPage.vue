<template>
  <q-page
    id="compiler"
    class="pageBg"
  >
    <div v-if="compiling">
      <canvas id="compileCanvas"></canvas>
    </div>
    <div v-else>
      <q-bar class="bg-teal">
        <q-icon name="laptop_chromebook" />
        <div>Riffr</div>

        <q-space />

        <div class="text-center q-mr-md">
          Compiler
        </div>

        <q-space />

        <q-btn
          dense
          flat
          icon="close"
          @click="dash"
          label="Close"
        />
      </q-bar>
      <div
        id="resCard"
        class="q-pa-md q-ma-md"
      >

        <div class="text-center txtH2">
          Compiled: {{ store.montageName }}
        </div>
        <q-separator />
        <div class="text-center text-h6">Used {{ store.montage.length }} Images</div>

      </div>
      <video
        id="vid"
        loop
        v-if="store.vidObjUrl"
        :src="store.vidObjUrl"
        controls
      ></video>
      <img
        v-if="store.gifObjUrl"
        :src="store.gifObjUrl"
        alt="GIF HERE"
      >
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import gifshot from "gifshot";
import { api } from "boot/axios";

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
      /** @type {HTMLCanvasElement} */
      canvas,
      started = false,
      capture = false,
      mediaRecorder,
      stream,
      drawStop = false,
      compDial,
      snapshots = [];

    const unloadWarn = async (evt) => {
      evt.returnValue = true;
    };

    onMounted(() => {
      window.addEventListener("beforeunload", unloadWarn);
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

    onBeforeUnmount(async () => {
      window.removeEventListener("beforeunload", unloadWarn);
    });

    const uploadFile = async (file) => {
      const signedUrl = await api.post("/api/upload", {
        fileName: `${store.montageName}.${store.isExtWebm ? "webm" : "gif"}`,
      });

      $q.notify({
        message: signedUrl.data.message,
        color: "dark",
        progress: true,
      });

      return new Promise((resolve, reject) => {
        const xhr = new window.XMLHttpRequest();
        xhr.open("PUT", signedUrl.data.url);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(file);
        xhr.addEventListener("load", () => {
          $q.notify({
            message: "Uploaded to Riffr Gallery!",
            actions: [
              {
                title: "LINK",
              },
              {
                title: "DISMISS",
              },
              {
                title: "QR CODE",
              },
            ],
            timeout: 0,
            color: "dark",
          });
        });
      });
    };

    watch(count, (val) => {
      if (val == store.montage.length && !started) {
        started = true;
        compileMontage();
      }
      if (val == store.montage.length * 2 + store.isExtWebm ? 1 : 0) {
        capture = true;
        if (store.isExtWebm)
          recordVid(canvas)
            .then((res) => {
              store.createVid(res);
              $q.notify("Success!");
            })
            .catch((err) => console.log(err));
      }
      if (val == store.montage.length * 3) {
        if (store.isExtWebm) {
          then = window.performance.now();
          setTimeout(() => {
            drawStop = true;
            mediaRecorder.stop();
          }, 1000 / store.fps);
        } else {
          then = window.performance.now();
          setTimeout(() => {
            drawStop = true;
          }, 1000 / store.fps);
          gifshot.createGIF(
            {
              images: snapshots,
              interval: 1 / store.fps,
              gifWidth: window.innerWidth,
              gifHeight: window.innerHeight,
            },
            (obj) => {
              store.createGif(obj.image);
              fetch(obj.image).then(async (res) => {
                const blob = await res.blob();
                uploadFile(blob).catch((error) => console.log(error));
              });
            }
          );
        }
      }
    });

    const recordVid = (canvas) => {
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

          uploadFile(blob).catch((error) => console.log(error));

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
          store.isExtWebm
            ? stream.getVideoTracks()[0].requestFrame()
            : snapshots.push(canvas.toDataURL("image/png", 1));
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
#resCard
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
.txtH2
	font-weight: bold
	font-size: 3em
</style>
