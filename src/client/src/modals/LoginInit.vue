<template>
  <Modal ref="modalRef">
    <h1>Login</h1>
    <p>{{ motd }}</p>
    <p>Please enter your username to continue.</p>

    <form
      @submit.prevent="onContinue"
      style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start"
    >
      <Entry v-model="username" placeholder="Username" />
      <Button type="submit">Continue</Button>
    </form>

    <p class="subtext" style="margin-top: 0.5rem">Zarium Version: {{ version }}</p>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../store';
import Modal from '../components/Modal.vue';
import Entry from '../components/Entry.vue';
import Button from '../components/Button.vue';
import LoadingModal from '../components/LoadingModal.vue';
import { animationCooldown, fetchWithCsrf } from '../utils';

const props = defineProps<{
  motd: string;
  version: string;
}>();

const store = useAppStore();
const username = ref('');
const modalRef = ref(null);

async function onContinue() {
  const user = username.value.trim();
  if (!user) {
    store.addNotification({
      title: "Error",
      content: "Please fill out all fields.",
      type: "error"
    });
    return;
  }

  store.setModal(LoadingModal);
  await animationCooldown();

  try {
    const res = await fetchWithCsrf("/api/auth/get_account_status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user })
    });

    const data = await res.json();

    if (!res.ok) {
      store.addNotification({
        title: "Error",
        content: data.detail || "An unknown error occurred.",
        type: "error"
      });
      store.setModal(() => h(LoginInit, { motd: props.motd, version: props.version }));
      return;
    }

    if (data.setup) {
        // Import dynamically to avoid circular dependencies if any
        const { SetupInit } = await import('./login_parts');
        store.setModal(() => h(SetupInit, { response: { ...data, motd: props.motd, version: props.version } }));
    } else {
        const { LoginPassword } = await import('./login_parts');
        store.setModal(() => h(LoginPassword, { response: { ...data, motd: props.motd, version: props.version } }));
    }
  } catch (e) {
    store.addNotification({
      title: "Error",
      content: "A connection error occurred.",
      type: "error"
    });
    store.setModal(() => h(LoginInit, { motd: props.motd, version: props.version }));
  }
}
</script>

<script lang="ts">
import { h, defineComponent } from 'vue';
import LoginInitComp from './LoginInit.vue';

export const LoginInit = defineComponent({
    props: ['motd', 'version'],
    setup(props) {
    return () => h(LoginInitComp, { motd: props.motd, version: props.version });
  }
});
</script>
