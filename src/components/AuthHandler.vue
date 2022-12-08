<template>
  <div v-if="showSettings">
    <q-btn
      no-caps
      push
      color="primary"
      label="Let's Get Started!"
      @click="show()"
    />
  </div>
  <div v-else>
    <q-page-sticky
      :offset="[18, 18]"
      position="top-left"
    >
      <q-btn
        id="logout"
        @click="show()"
        color="brown"
      >
        <q-icon
          :name="`img:${settingsIcon}`"
          size="md"
        />
      </q-btn>
    </q-page-sticky>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import { useRouter } from "vue-router";
import signupIcon from "assets/icons/icons8-add-100.png";
import loginIcon from "assets/icons/icons8-enter-100.png";
import changeIcon from "assets/icons/icons8-password-reset-100.png";
import deleteIcon from "assets/icons/icons8-delete-database-100.png";
import settingsIcon from "assets/icons/icons8-settings-100.png";
import { api } from "boot/axios";

export default defineComponent({
  name: "AuthHandler",

  setup() {
    const $q = useQuasar();
    const store = useStore();
    const router = useRouter();

    const emailVal = ref("");
    const pwdVal = ref("");
    const pwdValOld = ref("");
    const pwdShow = ref(false);
    const pwdIsNew = ref(false);
    const showSettings = router.currentRoute.value.name == "Home";

    const signUp = async () => {
      try {
        const user = await api.post("/auth/signup", {
          email: emailVal.value,
          password: pwdVal.value,
        });
        $q.notify({
          message: user.data.message,
          color: "dark",
        });
      } catch (error) {
        $q.notify({
          message: error.response.data.message,
          progress: true,
          color: "dark",
        });
      }
    };

    const logIn = async () => {
      try {
        const user = await api.post("/auth/login", {
          email: emailVal.value,
          password: pwdVal.value,
        });
        $q.notify({
          message: user.data.message,
          color: "dark",
        });
        store.logIn(user.data);
        router.push({
          name: store.onboarded ? "Dashboard" : "Onboard",
        });
      } catch (error) {
        $q.notify({
          message: error.response.data.message,
          color: "dark",
          progress: true,
        });
      }
    };

    const deleteUser = async () => {
      try {
        const res = await api.delete("/api/delete");
        $q.notify({
          message: res.data.message,
          color: "dark",
        });
        store.logOut();
        router.push({
          name: "Home",
        });
      } catch (error) {
        $q.notify({
          message: error.response.data.message,
          color: "dark",
          progress: true,
        });
      }
    };

    const changePassword = async () => {
      try {
        const res = await api.post("/api/reset", {
          email: emailVal.value,
          password: pwdValOld.value,
          newPassword: pwdVal.value,
        });
        $q.notify({
          message: res.data.message,
          color: "dark",
        });
      } catch (error) {
        $q.notify({
          message: error.response.data.message,
          color: "dark",
          progress: true,
        });
      }
      pwdVal.value = "";
      pwdValOld.value = "";
    };

    const notifier = (arr, position) => {
      let notif = $q.notify({
        position,
        group: false,
        message: arr.pop(),
        timeout: 0,
        color: "dark",
        actions: [
          {
            label: "GO",
            noDismiss: true,
            handler: () => {
              arr.length > 1
                ? notif({
                    message: arr.pop(),
                  })
                : notif({
                    message: arr.pop(),
                    actions: [
                      {
                        label: "OK",
                        noDismiss: false,
                      },
                    ],
                  });
            },
          },
        ],
      });
      return notif;
    };

    const email = (title, next, nextMsg, nextAction) => {
      $q.dialog({
        dark: true,
        title,
        message: "What is your email?",
        prompt: {
          filled: true,
          model: emailVal,
          type: "email",
          isValid: (val) =>
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
              val
            ),
        },
        cancel: true,
        persistent: true,
      }).onOk((data) => {
        console.log("Email:", data);
        next(title, nextMsg, nextAction);
      });
    };

    const pwd = (title, message, action) => {
      let instructions;
      if (pwdIsNew.value) {
        instructions = notifier(
          [
            "8-15 characters in length",
            "At least one symbol",
            "At least one number",
            "At least two letters",
            "Please follow these rules:",
          ],
          "top"
        );
      }
      const toggle = $q.notify({
        color: "dark",
        position: "bottom",
        message: "Password Visibility",
        timeout: 0,
        onDismiss: () => {
          if (pwdIsNew.value) {
            instructions();
          }
        },
        actions: [
          {
            label: "TOGGLE",
            handler: () => {
              pwdShow.value = !pwdShow.value;
              pwdPrompt.hide();
              toggle();
              pwd(title, message, action);
            },
          },
        ],
      });
      const pwdPrompt = $q
        .dialog({
          dark: true,
          title,
          message,
          prompt: {
            filled: true,
            maxlength: 15,
            counter: true,
            model: pwdVal,
            type: pwdShow.value ? "text" : "password",
            isValid: (val) =>
              /^(?=(.*[a-zA-Z].*){2,})(?=.*\d.*)(?=.*\W.*)[a-zA-Z0-9\S]{8,15}$/.test(
                val
              ),
            // Strong password with min 8 - max 15 character length, at least two letters (not case sensitive), one number, one special character (all, not just defined), space is not allowed.
          },
          cancel: true,
          persistent: true,
        })
        .onOk((data) => {
          console.log("Password:", data);
          toggle();
          action();
        })
        .onCancel(() => {
          toggle();
        });
    };

    const removal = () => {
      $q.dialog({
        title: "Account Deletion",
        message:
          "Proceed with removal of your account and data associated with Montaggio?",
        dark: true,
        cancel: true,
        ok: true,
        persistent: true,
        focus: "ok",
      }).onOk(() => {
        $q.dialog({
          title: "Are you sure?",
          message: "Your data will be permanently erased",
          dark: true,
          cancel: true,
          ok: true,
          persistent: true,
          focus: "cancel",
        }).onOk(() => {
          deleteUser();
        });
      });
    };

    const change = () => {
      pwdIsNew.value = true;
      pwdValOld.value = pwdVal.value;
      pwdVal.value = "";
      pwd("Reset Password", "Enter a new password:", changePassword);
    };

    const show = (grid) => {
      store.loggedIn && showSettings
        ? router.push({
            name: store.onboarded ? "Dashboard" : "Onboard",
          })
        : $q
            .bottomSheet({
              dark: true,
              message: "Choose an action:",
              grid: true,
              style: {
                fontSize: "1rem",
              },
              class: "iconizer",
              actions: store.loggedIn
                ? [
                    {
                      label: "Change Password",
                      img: changeIcon,
                      color: "primary",
                      id: "reset",
                    },
                    {
                      label: "Remove Account & Data",
                      img: deleteIcon,
                      color: "primary",
                      id: "remove",
                    },
                  ]
                : [
                    {
                      label: "Sign Up",
                      img: signupIcon,
                      color: "primary",
                      id: "signup",
                    },
                    {
                      label: "Log In",
                      img: loginIcon,
                      color: "primary",
                      id: "login",
                    },
                  ],
            })
            .onOk((action) => {
              console.log("Action chosen:", action.id);
              switch (action.id) {
                case "signup":
                  pwdIsNew.value = true;
                  email("Sign Up", pwd, "Set your password!", signUp);
                  break;
                case "login":
                  pwdIsNew.value = false;
                  email("Sign In", pwd, "Enter your password!", logIn);
                  break;
                case "reset":
                  pwdIsNew.value = false;
                  pwd("Reset Password", "Verify current password:", change);
                  break;
                case "remove":
                  removal();
              }
            });
    };

    return { show, store, showSettings, settingsIcon };
  },
});
</script>

<style lang="sass">
.iconizer
	text-align: center
	img
		background: violet
		border-radius: 7px
	div
		justify-content: space-evenly
</style>
