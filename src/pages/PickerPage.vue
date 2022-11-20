<template>
  <q-page class="pageBg">
    <q-bar class="bg-teal">
      <q-icon name="laptop_chromebook" />
      <div>Riffr - Picker</div>

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
        label="Close"
      />
    </q-bar>
    <div class="q-pa-sm q-pl-md row items-center">
      <div class="cursor-pointer non-selectable">
        <span
          class="q-px-md q-py-xs"
          id="fileText"
        >File</span>
        <q-menu ref="fileMenu">
          <q-list
            dense
            style="min-width: 100px"
          >
            <div>
              <q-file
                ref="picker"
                outlined
                accept="image/*"
                v-model="images"
                @update:model-value="organizeImgs"
                @rejected="onRejected"
                multiple
                max-files="120"
                max-file-size="5242880"
                :display-value="`Upload Images (${images.length}/120)`"
                dense
                append
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>

            <q-separator />

            <div>
              <q-select
                color="grey-3"
                outlined
                label-color="orange"
                v-model="items"
                :options="itemsOptions"
                label="Items Per Page"
                @update:model-value="resetPages"
              >
                <template v-slot:prepend>
                  <q-icon
                    :name="`img:${itemsIcon}`"
                    color="orange"
                  />
                </template>
              </q-select>
            </div>

            <q-separator />

            <q-item
              clickable
              v-close-popup
            >
              <q-item-section @click="confirmEmpty">Clear Picker</q-item-section>
            </q-item>

            <q-separator />

            <q-item
              clickable
              v-close-popup
            >
              <q-item-section @click="info">Current Info</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
    <q-separator />

    <div class="q-mb-lg q-pb-lg">
      <div
        v-if="imagesPreview.length && !detecting"
        :class="{
          'q-pa-md': true,
          dimmed: loading,
        }"
      >
        <div class="row justify-center">
          <div
            v-for="img in imagesPreview"
            :key="img.index"
            class="col-sm-6 col-md-3"
          >
            <q-card class="q-ma-lg dataCards">
              <q-card-section class="flex flex-center">
                <q-img
                  loading="eager"
                  fetchpriority="high"
                  :src="img.url"
                  fit="contain"
                  class="text-center cardImg"
                  :alt="img.name"
                  :placeholder-src="loadGif"
                  no-spinner
                  no-native-menu
                >
                  <div class="absolute-bottom">
                    <div class="text-subtitle2">Image #{{ img.index + 1 }}</div>
                    <div class="text-subtitle4">{{ humanFileSize(img.size) }}</div>
                  </div>
                </q-img>
              </q-card-section>
              <q-card-section class="q-pt-none flex items-center justify-evenly">
                <q-card-actions>
                  <q-btn
                    icon="arrow_back"
                    size="sm"
                  />
                  <q-btn
                    color="red"
                    :icon="`img:${trashIcon}`"
                    size="md"
                    @click="removeImg(img.index)"
                  />
                  <q-btn
                    icon="arrow_forward"
                    size="sm"
                  />
                </q-card-actions>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
      <div
        v-if="loading"
        class="absolute-center"
      >
        <q-img
          width="25vw"
          :src="loadGif"
          alt="Loading..."
        ></q-img>
      </div>
      <div
        v-if="detecting"
        class="absolute-center"
      >
        <q-img
          width="25vw"
          :src="detectGif"
          alt="Detecting..."
          id="gif"
        />
        <div class="text-subtitle1 text-center">Detecting Faces...</div>
        <q-linear-progress
          size="25px"
          :value="progress / images.length"
          color="accent"
        >
          <div class="absolute-full flex flex-center">
            <q-badge
              color="white"
              text-color="accent"
              :label="`${Math.round((progress / images.length) * 100)} %`"
            />
          </div>
        </q-linear-progress>
      </div>
    </div>

    <q-page-sticky
      v-if="images.length && !detecting"
      position="bottom"
      :offset="[0, 18]"
    >
      <div id="paginationTab">
        <q-pagination
          :disable="loading"
          v-model="currentPage"
          :min="1"
          :max="pages"
          :max-pages="7"
          push
          ellipses
          direction-links
          icon-prev="fast_rewind"
          icon-next="fast_forward"
          @update:model-value="organizeImgs"
        />
      </div>
    </q-page-sticky>
    <q-page-sticky
      v-if="images.length && !detecting"
      position="bottom-right"
      :offset="[18, 18]"
      class="text-center"
    >
      <q-btn
        color="indigo"
        :disable="!modelReady"
        label="DETECT"
        @click="runModel"
        class="q-mb-md"
      />
      <br>
      <q-btn
        color="orange"
        :disable="!detected"
        label="NEXT"
        @click="startEditing"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import ml5 from "ml5";
import itemsIcon from "assets/icons/icons8-table-of-content-100.png";
import loadGif from "assets/icons/icons8-download.gif";
import trashIcon from "assets/icons/icons8-trash-100.png";
import detectGif from "assets/icons/icons8-clock.gif";

export default defineComponent({
  name: "PickerPage",

  setup() {
    const $q = useQuasar();
    const store = useStore();
    const router = useRouter();
    const fileMenu = ref();
    const picker = ref();
    const images = ref([]);
    const items = ref(25);
    const itemsOptions = [5, 10, 15, 20, 25];
    const currentPage = ref(1);
    const pages = ref(1);
    const imagesPreview = ref([]);
    const loading = ref(false);
    const modelReady = ref(false);
    const progress = ref(0);
    const boxes = ref([]);
    const detecting = ref(false);
    const notFound = ref([]);
    const detected = ref(false);

    const api = ml5.faceApi(
      {
        withLandmarks: true,
        withDescriptors: false,
      },
      async () => {
        modelReady.value = true;
        $q.notify("ML5 model loaded into the browser!");
      }
    );

    onMounted(() => {
      window.addEventListener("beforeunload", (evt) => {
        evt.returnValue = true;
      });
      if (!store.montageName) {
        $q.notify({
          message: "Please start your montage from the Dashboard!",
          progress: true,
        });
        router.push({
          name: "Dashboard",
        });
      }
    });

    const organizeImgs = (arr) => {
      loading.value = true;
      for (let i of imagesPreview.value) {
        URL.revokeObjectURL(i.url);
        delete i.name;
        delete i.size;
        delete i.index;
        delete i.url;
        i = null;
      }
      imagesPreview.value = [];
      fileMenu.value.hide();
      const mod = images.value.length % items.value;
      pages.value =
        Math.floor(images.value.length / items.value) + (mod == 0 ? 0 : 1);
      const startIndex = (currentPage.value - 1) * items.value;
      const endIndex =
        startIndex +
        (currentPage.value == pages.value && mod != 0 ? mod : items.value) -
        1;
      for (let i = startIndex; i <= endIndex; i++) {
        imagesPreview.value.push({
          name: images.value[i].name,
          size: images.value[i].size,
          index: i,
          url: URL.createObjectURL(images.value[i]),
        });
      }
      loading.value = false;
    };

    const onRejected = (arr) => {
      for (let rej of arr) {
        switch (rej.failedPropValidation) {
          case "accept":
            $q.notify("Wrong File Type Chosen");
            break;
          case "max-file-size":
            $q.notify("File Size Limit Exceeded");
            break;
          case "max-files":
            $q.notify("File Number Limit Exceeded");
            break;
        }
      }
    };

    const resetPages = () => {
      currentPage.value = 1;
      organizeImgs();
    };

    const removeImg = (i) => {
      images.value.splice(i, 1);
      if (!images.value.length) {
        imagesPreview.value = [];
        picker.value = null;
      } else organizeImgs();
    };

    const humanFileSize = (bytes, si = true, dp = 1) => {
      const thresh = si ? 1000 : 1024;

      if (Math.abs(bytes) < thresh) {
        return bytes + " B";
      }

      const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
      let u = -1;
      const r = 10 ** dp;

      do {
        bytes /= thresh;
        ++u;
      } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
      );

      return bytes.toFixed(dp) + " " + units[u];
    };

    const confirmEmpty = () => {
      $q.dialog({
        title: "Empty Picker Data",
        message: "Are you sure you want to start picking from scratch?",
        cancel: true,
        dark: true,
        persistent: true,
      }).onOk(() => {
        imagesPreview.value = [];
        images.value = [];
        picker.value = null;
        $q.notify({
          message: "Feel free to pick now!",
        });
      });
    };

    const info = () => {
      let nameInfo = $q.notify({
        position: "bottom",
        message: `Project Name: ${store.montageName}`,
        timeout: 0,
      });
      let totalSize = 0;
      for (let i of images.value) {
        totalSize += i.size;
      }
      let sizeInfo = $q.notify({
        message: `Total Size of Selected Images: ${humanFileSize(totalSize)}`,
        position: "bottom",
        timeout: 0,
      });
      $q.dialog({
        title: "Montage Information",
        message: "Import details about your configuration:",
        cancel: false,
        persistent: true,
        dark: true,
      }).onOk(() => {
        nameInfo();
        sizeInfo();
      });
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

    const runModel = async () => {
      detecting.value = true;
      if (modelReady.value) {
        let img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          api.detect(img, (err, res) => {
            res.length
              ? boxes.value.push(res)
              : notFound.value.push(progress.value);
            if (err) console.log(err);
            progress.value++;
            if (progress.value < images.value.length) runModel();
            else {
              detecting.value = false;
              img = null;
              if (notFound.value.length) {
                console.log("Image(s) with no faces detected - removing!");
                for (let i = notFound.value.length - 1; i >= 0; i--) {
                  images.value.splice(notFound.value[i], 1);
                }
                currentPage.value = 1;
                organizeImgs();
              }
              progress.value = 0;
              notFound.value = [];
              store.setFiles(images.value, boxes.value);
              boxes.value = [];
              detected.value = true;
            }
          });
        };
        img.src = URL.createObjectURL(images.value[progress.value]);
      }
    };

    const startEditing = () => {
      router.push({ name: "Editor" });
    };

    return {
      removeImg,
      trashIcon,
      resetPages,
      fileMenu,
      picker,
      images,
      onRejected,
      itemsIcon,
      items,
      itemsOptions,
      organizeImgs,
      currentPage,
      pages,
      imagesPreview,
      loading,
      loadGif,
      humanFileSize,
      confirmEmpty,
      store,
      info,
      dash,
      detectGif,
      progress,
      detecting,
      modelReady,
      runModel,
      detected,
      startEditing,
    };
  },
});
</script>

<style lang="sass">
.cardImg
	border-radius: 18px
	background: aquamarine
	width: 17.5vw
	height: 17.5vw
	body.screen--sm &
		width: 30vw
		height: 30vw
	img
		padding: 0.5rem
.dataCards
	backdrop-filter: blur(5px)
	background-color: rgba(255, 255, 255, 1)
	border-radius: 26px
	box-shadow: 35px 35px 68px 0px rgba(145, 192, 255, 0.5), inset -8px -8px 16px 0px rgba(145, 192, 255, 0.6), inset 0px 11px 28px 0px rgb(255, 255, 255)
#paginationTab
	background: antiquewhite
	padding: 10px
	border: 3px aqua solid
	border-radius: 18px
.preview
	width: 40vw
#fileText
	background: white
	border-radius: 7px
	border: 1px solid #001D3D
#gif
	border-radius: 7px
</style>
