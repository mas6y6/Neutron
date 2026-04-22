<template>
  <div class="SettingsModal" :class="{ show: visible }">
    <div class="SettingsLayout">
      <div class="SettingsSidebar">
        <h3>Settings</h3>
        <div class="SidebarItems">
          <button 
            v-for="page in pages"
            :key="page.id"
            class="SidebarItem"
            :class="{ active: currentPage === page.id }"
            @click="currentPage = page.id"
          >
            {{ page.name }}
          </button>
        </div>
        <div class="SidebarFooter">
          <Button color="danger" @click="confirmLogout">Logout</Button>
        </div>
      </div>
      <div class="SettingsContent">
        <div v-if="loading" style="text-align: center; padding: 20px;">
          <LoadingCircle />
          <p>Loading settings...</p>
        </div>
        <div v-else>
          <div v-if="currentPage === 'account'">
            <h4>Account Settings</h4>
            <p>Username: {{ userData?.username }}</p>
            <!-- More account settings... -->
          </div>
          <div v-else-if="currentPage === 'profile'">
            <h4>Profile Settings</h4>
            <p>Display Name: {{ userData?.displayname }}</p>
            <!-- More profile settings... -->
          </div>
          <div v-else-if="currentPage === 'appearance'">
            <h4>Appearance</h4>
            <div class="SettingRow">
              <span>Dark Mode</span>
              <Switch v-model="isDark" @update:modelValue="toggleTheme" />
            </div>
          </div>
          <div v-else-if="currentPage === 'security'">
            <h4>Security</h4>
            <!-- More security settings... -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppStore } from '../store';
import Button from '../components/Button.vue';
import Switch from '../components/Switch.vue';
import LoadingCircle from '../components/LoadingCircle.vue';
import Modal from '../components/Modal.vue';
import { fetchWithCsrf, logout } from '../utils';

const store = useAppStore();
const visible = ref(false);
const currentPage = ref('account');
const userData = ref<any>(null);
const loading = ref(true);
const isDark = ref(true);

const pages = [
  { id: 'account', name: 'Account' },
  { id: 'profile', name: 'Profile' },
  { id: 'appearance', name: 'Appearance' },
  { id: 'security', name: 'Security' },
];

onMounted(async () => {
  requestAnimationFrame(() => visible.value = true);
  
  isDark.value = (localStorage.getItem("theme") || "dark") === "dark";

  try {
    const res = await fetchWithCsrf("/api/auth/get-user-data");
    if (res.ok) {
      userData.value = await res.json();
    }
  } catch (e) {
    console.error("Failed to load user data", e);
  } finally {
    loading.value = false;
  }
});

function toggleTheme(dark: boolean) {
  const theme = dark ? "dark" : "light";
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
}

function confirmLogout() {
  store.setModal(() => h(Modal, null, {
    default: () => [
      h('h1', 'Logout'),
      h('p', 'Are you sure you want to logout?'),
      h('div', { style: { display: 'flex', gap: '0.5rem' } }, [
        h(Button, { color: 'danger', onClick: logout }, 'Logout'),
        h(Button, { color: 'secondary', onClick: () => store.setModal(SettingsModal) }, 'Cancel')
      ])
    ]
  }));
}
</script>

<script lang="ts">
import { defineComponent, h } from 'vue';
import SettingsModalComp from './SettingsModal.vue';

export const SettingsModal = defineComponent({
  setup() {
    const store = useAppStore();
    return () => h(SettingsModalComp);
  }
});
</script>
