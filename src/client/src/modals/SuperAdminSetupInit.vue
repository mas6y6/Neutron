<template>
  <Modal>
    <h1>Server setup</h1>
    <p>
      This server's user database is empty (assuming this is the first
      time this server has been started)
    </p>
    <p>
      To continue with your server setup please enter your superadmin
      key located in your server log.
    </p>

    <form 
      @submit.prevent="onClick"
      style="display: flex; gap: 10px"
    >
      <Entry v-model="key" placeholder="Superadmin key"/>
      <Button type="submit">Continue</Button>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, defineComponent, h } from 'vue';
import { useAppStore } from '../store';
import Modal from '../components/Modal.vue';
import Entry from '../components/Entry.vue';
import Button from '../components/Button.vue';
import LoadingModal from '../components/LoadingModal.vue';
import { animationCooldown, fetchWithCsrf } from '../utils';
import { SetupAdminAccountCreation } from './setup_parts';

const store = useAppStore();
const key = ref('');

async function onClick() {
  const k = key.value.trim();

  if (!k) {
    store.addNotification({
      title: "Error",
      content: "Please fill out all fields.",
      type: "error",
    });
    return;
  }

  store.setModal(LoadingModal);
  await animationCooldown();

  try {
    let res = await fetchWithCsrf("/api/setup/check-superadmin-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k })
    });

    const data = await res.json();
    if (res.ok) {
      store.setModal(() => h(SetupAdminAccountCreation, { superAdminKey: k }));
    } else {
      store.addNotification({
        title: "Error",
        content: data.detail,
        type: "error"
      });
      store.setModal(SuperAdminSetupInit);
    }
  } catch (e) {
    store.addNotification({
      title: "Error",
      content: "A connection error occurred.",
      type: "error"
    });
    store.setModal(SuperAdminSetupInit);
  }
}
</script>

<script lang="ts">
import SuperAdminSetupInitComp from './SuperAdminSetupInit.vue';

export const SuperAdminSetupInit = defineComponent({
    setup() {
    return () => h(SuperAdminSetupInitComp);
  }
});
</script>
