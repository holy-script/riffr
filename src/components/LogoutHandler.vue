<template>
  <q-page-sticky
    position="bottom-left"
    :offset="[10, 10]"
  >
    <div
      v-if="store.loggedIn"
      style="position: relative;"
    >
      <q-btn
        id="logout"
        @click="confirm"
      >
        <q-icon
          :name="`img:${logoutIcon}`"
          size="md"
        />
      </q-btn>
    </div>
  </q-page-sticky>

</template>

<script>
import { defineComponent } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useStore } from "stores/app";
import { endSession } from "boot/appwrite";
import logoutIcon from "assets/icons/icons8-logout-100.png";

export default defineComponent({
  name: "LogoutHandler",
  setup() {
    const store = useStore();
    const $q = useQuasar();
    const router = useRouter();

    function confirm(evt) {
      $q.dialog({
        dark: true,
        title: "Confirm",
        message: "Are you sure about logging out?",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        const res = await endSession();
        if (typeof res == "object") {
          $q.notify({
            message: "Logged Out!",
            color: "dark",
            progress: true,
          });
          store.logOut();
          router.push({
            name: "Home",
          });
        } else {
          $q.notify({
            message: res,
            color: "dark",
            progress: true,
          });
        }
      });
    }

    return {
      store,
      confirm,
      logoutIcon,
    };
  },
});
</script>

<style lang="sass">
#logout
	width: 3rem
	height: 3rem
	border-radius: 7px
	background: #FF7B00
	color: #001D3D
	border: 3px solid #001D3D

#bottomLeft
	width: 8px
	position: absolute
	bottom: 4.75px
	left: 1px
	background: #001D3D
	transform-origin: bottom
	transform: rotate(135deg)

#topRight
	width: 8px
	position: absolute
	top: 4.75px
	right: 1px
	background: #001D3D
	transform-origin: top
	transform: rotate(315deg)
</style>
