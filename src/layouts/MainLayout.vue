<template>
  <q-layout>
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="control animated backInDown"
          leave-active-class="control animated backOutDown"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
    <LogoutHandler />
    <MemoryHandler />
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import LogoutHandler from "components/LogoutHandler.vue";
import MemoryHandler from "components/MemoryHandler.vue";

export default defineComponent({
  name: "MainLayout",

  components: {
    LogoutHandler,
    MemoryHandler,
  },
});
</script>

<style lang="sass">
.control
	animation-duration: 1s
	border: 3px solid #001D3D
.pageBg
	background: #e29d30
body
	background: #63d3ee
</style>
