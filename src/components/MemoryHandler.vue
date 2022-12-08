<template>
  <q-page-sticky
    v-if="store.memDebug"
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
</template>

<script>
import { defineComponent } from "vue";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import { useMemory } from "@vueuse/core";

export default defineComponent({
  name: "MemoryHandler",
  setup() {
    const store = useStore();

    const size = (v) => {
      const kb = v / 1024 / 1024;
      return `${kb.toFixed(2)} MB`;
    };
    const { isSupported, memory } = useMemory();

    return {
      isSupported,
      memory,
      size,
      store,
    };
  },
});
</script>
