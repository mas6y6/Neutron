import { h, defineComponent, ref } from 'vue';
import { useAppStore } from '../store';
import Modal from '../components/Modal.vue';
import Entry from '../components/Entry.vue';
import Button from '../components/Button.vue';
import LoadingModal from '../components/LoadingModal.vue';
import { animationCooldown, fetchWithCsrf, obtainVaultKey } from '../utils';
import { renderApplication } from '../MainApplication';

export const SetupInit = defineComponent({
  props: ['response'],
  setup(props) {
    const store = useAppStore();
    const password = ref('');

    async function onSetup() {
      // implementation...
    }

    return () => h(Modal, null, {
      default: () => [
        h('h1', 'Setup Account'),
        h('p', 'Your account needs to be set up.'),
        h('form', { 
            onSubmit: (e: Event) => { e.preventDefault(); onSetup(); },
            style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
        }, [
          h(Entry, { 
              type: 'password', 
              placeholder: 'Password',
              modelValue: password.value,
              'onUpdate:modelValue': (v: string) => password.value = v
          }),
          h(Button, { type: 'submit' }, 'Setup')
        ])
      ]
    });
  }
});

export const LoginPassword = defineComponent({
  props: ['response'],
  setup(props) {
    const store = useAppStore();
    const password = ref('');

    async function onSignIn() {
        const pass = password.value.trim();
        if (!pass) {
            store.addNotification({ title: "Error", content: "Please enter your password.", type: "error" });
            return;
        }

        store.setModal(LoadingModal);
        await animationCooldown();

        try {
            const res = await fetchWithCsrf("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: props.response.username, password: pass })
            });
            const data = await res.json();
            if (res.ok) {
                await obtainVaultKey(pass, data);
                store.closeModal();
                await renderApplication();
            } else {
                store.addNotification({ title: "Error", content: data.detail, type: "error" });
                store.setModal(() => h(LoginPassword, { response: props.response }));
            }
        } catch (e) {
            store.addNotification({ title: "Error", content: "A connection error occurred.", type: "error" });
            store.setModal(() => h(LoginPassword, { response: props.response }));
        }
    }

    return () => h(Modal, null, {
      default: () => [
        h('h1', 'Login'),
        h('p', props.response.motd),
        h('p', `Hello, ${props.response.username}!`),
        h('form', { 
            onSubmit: (e: Event) => { e.preventDefault(); onSignIn(); },
            style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
        }, [
          h(Entry, { 
              type: 'password', 
              placeholder: 'Password',
              modelValue: password.value,
              'onUpdate:modelValue': (v: string) => password.value = v
          }),
          h(Button, { type: 'submit' }, 'Sign In')
        ])
      ]
    });
  }
});
