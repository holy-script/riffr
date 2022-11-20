<template>
  <q-page
    class="flex flex-center column pageBg"
    padding
  >
    <div id="floatCtr">
      <q-img
        id="floatImg"
        :src="camImg"
        class="absolute-center"
      />
    </div>
    <h1 class="q-mt-xl q-pt-lg q-mb-md">Smile!</h1>
    <div>
      <q-card
        flat
        bordered
        id="landingCard"
        class="q-my-md q-pa-md text-center"
      >
        <q-card-section>
          <div class="text-h4">What is Riffr?🤔</div>
        </q-card-section>

        <q-card-section class="q-pt-none text-h6">
          It is basically a tool that creates photo montages, albeit in a different fashion. How so, you ask?
        </q-card-section>

        <q-separator inset />

        <q-card-section class="text-h6">
          Riffr uses a Machine Learning pre-trained model graciously provided by <a href="http://ml5js.org">ml5</a> and uses it to detect faces in photos. Then, it helps you put your face front and center of the montage, so you can show yourself transition through the images like a quick flipbook📗.
        </q-card-section>
      </q-card>
    </div>
    <AuthHandler />
  </q-page>
</template>

<script>
import { defineComponent, onMounted } from "vue";
import AuthHandler from "components/AuthHandler.vue";
import gsap from "gsap";
import camImg from "assets/images/cam.png";

export default defineComponent({
  name: "IndexPage",

  components: {
    AuthHandler,
  },

  setup() {
    onMounted(() => {
      gsap
        .timeline()
        .to("#floatCtr", {
          y: "random(-10, -20)",
          ease: "power1.inOut",
          duration: 2,
        })
        .to("#floatCtr", {
          y: 0,
          ease: "power1.inOut",
          duration: 2,
        })
        .repeat(-1);
    });
    return {
      camImg,
    };
  },
});
</script>

<style lang="sass">
#floatCtr
	position: relative
	body.screen--xs &
		margin-top: 4em
#floatImg
	width: 25vw
	body.screen--sm &
		width: 50vw
	body.screen--xs &
		width: 50vw
#landingCard
	backdrop-filter: blur(5px)
	background-color: rgba(255, 255, 255, 1)
	border-radius: 26px
	box-shadow: 35px 35px 68px 0px rgba(145, 192, 255, 0.5), inset -8px -8px 16px 0px rgba(145, 192, 255, 0.6), inset 0px 11px 28px 0px rgb(255, 255, 255)
	width: 75vw
	body.screen--sm &
		width: 90vw
</style>
