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
    <q-page-sticky
      position="top"
      :offset="[0, 18]"
    >
      <q-card>
        <q-card-section>
          <div v-if="isSupported && memory">
            <template v-if="memory">
              <div>
                Used
              </div>
              <div>{{ size(memory.usedJSHeapSize) }}</div>
              <div>
                Allocated
              </div>
              <div>{{ size(memory.totalJSHeapSize) }}</div>
              <div>
                Limit
              </div>
              <div>{{ size(memory.jsHeapSizeLimit) }}</div>
            </template>
          </div>
          <div v-else>
            Your browser does not support performance memory API
          </div>
        </q-card-section>
      </q-card>
    </q-page-sticky>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import LogoutHandler from "components/LogoutHandler.vue";
import { useMemory } from "@vueuse/core";

export default defineComponent({
  name: "MainLayout",

  components: {
    LogoutHandler,
  },

  setup() {
    const size = (v) => {
      const kb = v / 1024 / 1024;
      return `${kb.toFixed(2)} MB`;
    };
    const { isSupported, memory } = useMemory();

    return {
      isSupported,
      memory,
      size,
    };
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
