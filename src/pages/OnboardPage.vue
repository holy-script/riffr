<template>
  <q-page>
    <q-carousel
      v-model="slide"
      transition-prev="jump-right"
      transition-next="jump-left"
      swipeable
      animated
      control-color="indigo"
      control-type="push"
      navigation
      padding
      arrows
      height="100vh"
      class="bg-grey text-white"
      @before-transition="dismiss"
    >
      <q-carousel-slide
        name="intro"
        class="column no-wrap flex-center"
      >
        <q-icon
          name="live_tv"
          size="56px"
        />
        <div class="q-mt-md text-center">
          Intro Here
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="about"
        class="column no-wrap flex-center"
      >
        <q-icon
          name="layers"
          size="56px"
        />
        <div class="q-mt-lg q-mb-lg text-center">
          User Details Here
          <EmailVerifier />
        </div>
        <q-btn
          no-caps
          push
          color="orange"
          text-color="blue"
          label="Hiya!"
          @click="profileName"
        />
      </q-carousel-slide>
      <q-carousel-slide
        name="style"
        class="column no-wrap flex-center"
      >
        <div class="text-center">
          Choose your user avatar!
        </div>
        <q-avatar
          rounded
          size="10rem"
          color="positive"
          class="q-mt-lg q-mb-lg"
        >
          <img :src="svg">
        </q-avatar>
        <q-btn
          no-caps
          push
          color="white"
          text-color="primary"
          label="Change Avatar"
          @click="designer"
        />
        <q-btn
          class="q-mt-lg"
          no-caps
          push
          color="white"
          text-color="warning"
          label="Toggle Accessory"
          @click="toggler"
        />
      </q-carousel-slide>
      <q-carousel-slide
        name="outro"
        class="column no-wrap flex-center"
      >
        <q-icon
          name="terrain"
          size="56px"
        />
        <div class="q-mt-lg q-mb-lg text-center">
          Pleasure getting to know you, {{nameVal || "friend"}}
        </div>
        <q-btn
          no-caps
          push
          color="positive"
          text-color="purple"
          label="To Dashboard"
          @click="finisher"
        />
      </q-carousel-slide>
    </q-carousel>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import { api } from "src/boot/axios";
import { createAvatar } from "@dicebear/avatars";
import * as bigSmile from "@dicebear/big-smile";
import EmailVerifier from "components/EmailVerifier.vue";

export default defineComponent({
  name: "OnboardPage",
  components: {
    EmailVerifier,
  },
  setup() {
    const slide = ref("intro");
    const nameVal = ref("");
    const ageVal = ref("");
    const $q = useQuasar();
    const store = useStore();
    let styling;
    let notifOpen = false;
    let acc = 100;
    const props = {
      skinColor: [
        "variant01",
        "variant02",
        "variant03",
        "variant04",
        "variant05",
        "variant06",
        "variant07",
        "variant08",
      ],
      hair: [
        "shortHair",
        "mohawk",
        "wavyBob",
        "bowlCutHair",
        "curlyBob",
        "straightHair",
        "braids",
        "shavedHead",
        "bunHair",
        "froBun",
        "bangs",
        "halfShavedHead",
        "curlyShortHair",
      ],
      hairColor: [
        "variant01",
        "variant02",
        "variant03",
        "variant04",
        "variant05",
        "variant06",
        "variant07",
        "variant08",
      ],
      eyes: [
        "cheery",
        "normal",
        "confused",
        "starstruck",
        "winking",
        "sleepy",
        "sad",
        "angry",
      ],
      mouth: [
        "openedSmile",
        "unimpressed",
        "gapSmile",
        "openSad",
        "teethSmile",
        "awkwardSmile",
        "braces",
        "kawaii",
      ],
      accessories: [
        "catEars",
        "glasses",
        "sailormoonCrown",
        "clownNose",
        "sleepMask",
        "sunglasses",
        "faceMask",
        "mustache",
      ],
    };
    const router = useRouter();

    onMounted(() => {
      if (store.onboarded) {
        $q.notify({
          message: "Already completed this step, moving to dashboard...",
          timeout: 1500,
          progress: true,
          color: "dark",
        });
        router.push({
          name: "Dashboard",
        });
      }
    });

    const createOptions = (optArr, cur) => {
      let options = {
        dataUri: true,
        accessoriesProbability: acc,
      };
      for (let key in optArr) {
        if (cur == key) {
          optArr[key].push(optArr[key].shift());
        }
        if (optArr["hair"][0] == "froBun" || optArr["hair"][0] == "bunHair") {
          options["translateY"] = 10;
        } else {
          options["translateY"] = 0;
        }
        options[key] = [optArr[key][0]];
      }
      return options;
    };
    const svg = ref(createAvatar(bigSmile, createOptions(props)));

    const styleAvatar = (notifs) => {
      let shifted = notifs[0];
      styling = $q.notify({
        multiLine: true,
        message: `Choose your ${notifs
          .shift()
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())}:`,
        timeout: 0,
        position: "top",
        color: "dark",
        group: false,
        classes: "center",
        onDismiss: () => {
          notifOpen = false;
        },
        actions: [
          {
            label: "NEXT",
            noDismiss: true,
            handler: () => {
              shifted = notifs[0];
              notifs.length > 1
                ? styling({
                    message: `Choose your ${notifs
                      .shift()
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}:`,
                  })
                : styling({
                    message: `Choose your ${notifs
                      .shift()
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}:`,
                    actions: [
                      {
                        label: "DONE",
                        noDismiss: false,
                      },
                      {
                        label: "SWITCH",
                        noDismiss: true,
                        handler: () => {
                          svg.value = createAvatar(
                            bigSmile,
                            createOptions(props, shifted)
                          );
                        },
                      },
                    ],
                  });
            },
          },
          {
            label: "SWITCH",
            noDismiss: true,
            handler: () => {
              svg.value = createAvatar(bigSmile, createOptions(props, shifted));
            },
          },
        ],
      });
    };

    const designer = () => {
      if (!notifOpen) {
        styleAvatar(Object.keys(props));
      }
      notifOpen = true;
    };

    const dismiss = (newPane, oldPane) => {
      if (oldPane == "style" && styling) {
        styling({
          actions: [],
          message: "Come back if you need any changes!",
          progress: true,
          timeout: 1000,
        });
      }
    };

    const toggler = () => {
      if (acc == 100) {
        acc = 0;
        svg.value = createAvatar(bigSmile, createOptions(props));
      } else {
        acc = 100;
        svg.value = createAvatar(bigSmile, createOptions(props));
      }
    };

    const profileName = () => {
      let aboutName = $q.notify({
        message: "Feel free to use your first name, full name or a nickname!",
        timeout: 0,
        color: "dark",
        position: "bottom",
        classes: "center",
      });
      $q.dialog({
        dark: true,
        title: "Create Profile",
        message: "What is your first name?",
        prompt: {
          filled: true,
          model: nameVal,
          maxLength: 15,
          type: "text",
          isValid: (val) =>
            /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g.test(val),
        },
        cancel: true,
        persistent: true,
      })
        .onOk((data) => {
          console.log("Name:", data);
          profileAge();
        })
        .onDismiss(() => {
          aboutName();
        });
    };

    const profileAge = () => {
      let aboutAge = $q.notify({
        message: "For demographic purposes only :)",
        timeout: 0,
        color: "dark",
        position: "bottom",
        classes: "center",
      });
      $q.dialog({
        dark: true,
        title: "Create Profile",
        message: "What is your age?",
        prompt: {
          filled: true,
          model: ageVal,
          maxLength: 3,
          type: "number",
          isValid: (val) => val > 0 && val < 100,
        },
        persistent: true,
      })
        .onOk((data) => {
          console.log("Age:", data);
        })
        .onDismiss(() => {
          aboutAge();
        });
    };

    const finisher = () => {
      if (nameVal.value && ageVal.value) {
        api
          .post("/api/onboard", {
            name: nameVal.value,
            age: parseInt(ageVal.value),
            profile: createOptions(props),
          })
          .then((res) => {
            store.onboard();
            $q.notify({
              message: res.data.message,
              timeout: 1500,
              progress: true,
              color: "dark",
            });
            router.push({
              name: "Dashboard",
            });
          })
          .catch(
            (err) =>
              $q.notify(err.response.data.message) &&
              console.log(err.response.status)
          );
      } else {
        $q.notify({
          message: "Please finish setting up your profile first...",
          timeout: 1500,
          progress: true,
          color: "dark",
        });
      }
    };

    return {
      slide,
      svg,
      designer,
      dismiss,
      toggler,
      profileName,
      nameVal,
      finisher,
    };
  },
});
</script>

<style lang="sass">
.center
	text-align: center
</style>
