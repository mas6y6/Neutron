import { h, defineComponent, ref } from 'vue';
import { useAppStore } from '../store';
import Modal from '../components/Modal.vue';
import Entry from '../components/Entry.vue';
import Button from '../components/Button.vue';
import LoadingModal from '../components/LoadingModal.vue';
import { animationCooldown, fetchWithCsrf, obtainVaultKey } from '../utils';
import { authCheck, renderApplication } from '../MainApplication';

export const SetupAdminAccountCreation = defineComponent({
  props: ['superAdminKey'],
  setup(props) {
    const store = useAppStore();
    const username = ref('');
    const displayName = ref('');
    const password = ref('');

    async function onClick() {
      const u = username.value.trim();
      const p = password.value.trim();
      const d = displayName.value.trim();

      if (!u || !p || !d) {
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
        let res = await fetchWithCsrf("/api/setup/create-superadmin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: u,
            password: p,
            displayName: d,
            superAdminKey: props.superAdminKey
          })
        });

        if (res.ok) {
          const data = await res.json();
          const auth = await authCheck();
          if (auth.success) {
            store.setSuperadmin(auth.superadmin || false);
          }

          await obtainVaultKey(p, data);
          store.closeModal();
          await renderApplication();
        } else {
          const data = await res.json();
          store.addNotification({
            title: "Error",
            content: data.detail,
            type: "error"
          });
          store.setModal(() => h(SetupAdminAccountCreation, { superAdminKey: props.superAdminKey }));
        }
      } catch (e) {
        store.addNotification({
          title: "Error",
          content: "A connection error occurred.",
          type: "error"
        });
        store.setModal(() => h(SetupAdminAccountCreation, { superAdminKey: props.superAdminKey }));
      }
    }

    return () => h(Modal, null, {
      default: () => [
        h('h1', 'Server SuperAdmin creation'),
        h('p', 'Please enter your account details to create this server\'s SuperAdmin account.'),
        h('p', { style: { color: "red" } }, [
          h('b', 'Warning:'), 
          ' If you forget your password, you will permanently lose access to this account and all data on the server.'
        ]),
        h('form', { 
            onSubmit: (e: Event) => { e.preventDefault(); onClick(); },
            style: { display: 'flex', flexDirection: 'column', gap: '10px' }
        }, [
          h(Entry, { 
              placeholder: 'Username', 
              modelValue: username.value,
              'onUpdate:modelValue': (v: string) => username.value = v
          }),
          h(Entry, { 
              placeholder: 'Display name', 
              modelValue: displayName.value,
              'onUpdate:modelValue': (v: string) => displayName.value = v
          }),
          h(Entry, { 
              type: 'password', 
              placeholder: 'Password', 
              modelValue: password.value,
              'onUpdate:modelValue': (v: string) => password.value = v
          }),
          h(Button, { type: 'submit' }, 'Create')
        ])
      ]
    });
  }
});
