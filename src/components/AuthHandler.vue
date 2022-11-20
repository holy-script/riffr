<template>
  <q-btn
    no-caps
    push
    color="primary"
    label="Let's Begin!"
    @click="show()"
  />
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "stores/app";
import signupIcon from "assets/icons/icons8-add-100.png";
import loginIcon from "assets/icons/icons8-enter-100.png";
import { createUser, createSession } from "boot/appwrite";

export default defineComponent({
  name: "AuthHandler",
  setup() {
    const $q = useQuasar();
    const store = useStore();
    const router = useRouter();

    let emailVal = ref("");
    let pwdVal = ref("");
    let authFlow = "";
    const pwdShow = ref(false);

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

    const email = () => {
      $q.dialog({
        dark: true,
        title: authFlow === "signup" ? "Sign Up" : "Log In",
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
        if (authFlow === "signup") {
          let toastClose = notifier(
            [
              "8-15 characters in length",
              "At least one symbol",
              "At least one number",
              "At least two letters",
              "Please follow these rules:",
            ],
            "top"
          );
          pwd(toastClose);
        } else pwd();
      });
    };

    const pwd = (close) => {
      const dial = $q
        .dialog({
          dark: true,
          title: authFlow === "signup" ? "Sign Up" : "Log In",
          message:
            authFlow === "signup"
              ? "Set your password!"
              : "Enter your password!",
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
        .onOk(async (data) => {
          console.log("Password:", data);
          if (authFlow === "signup") {
            const res = await createUser(emailVal.value, pwdVal.value);
            if (typeof res == "object") {
              $q.notify({
                message: "User created successfully, please log in!",
                color: "dark",
                progress: true,
              });
            } else {
              $q.notify({
                message: res,
                color: "dark",
                progress: true,
              });
            }
          } else {
            const res = await createSession(emailVal.value, pwdVal.value);
            if (typeof res == "object") {
              store.logIn();
              router.push({
                name: "Dashboard",
              });
            } else {
              $q.notify({
                message: res,
                color: "dark",
                progress: true,
              });
            }
          }
        })
        .onDismiss(() => {
          toggle();
        });
      const toggle = $q.notify({
        color: "dark",
        position: "bottom",
        message: "Password Visibility",
        timeout: 0,
        onDismiss: () => {
          if (authFlow === "signup") {
            close();
          }
        },
        actions: [
          {
            label: "TOGGLE",
            noDismiss: true,
            handler: () => {
              pwdShow.value = !pwdShow.value;
              dial.hide();
              toggle();
              if (authFlow === "signup") {
                close = notifier(
                  [
                    "8-15 characters in length",
                    "At least one symbol",
                    "At least one number",
                    "At least two letters",
                    "Please follow these rules:",
                  ],
                  "top"
                );
                pwd(close);
              } else {
                pwd();
              }
            },
          },
        ],
      });
    };

    const show = (grid) => {
      if (store.loggedIn) {
        router.push({
          name: "Dashboard",
        });
      } else {
        $q.bottomSheet({
          dark: true,
          message: "Authentication Panel",
          grid: true,
          style: {
            fontSize: "1rem",
          },
          class: "iconizer",
          actions: [
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
        }).onOk((action) => {
          console.log("Action chosen:", action.id);
          authFlow = action.id;
          email();
        });
      }
    };

    return { show };
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
