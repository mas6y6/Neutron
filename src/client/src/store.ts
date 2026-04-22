import { defineStore } from 'pinia';
import { markRaw } from 'vue';

export const useAppStore = defineStore('app', {
  state: () => ({
    superadmin: false,
    modal: null as any,
    modalVisible: false,
    notifications: [] as any[],
    background: {
      color: undefined as string | undefined,
      image: undefined as string | undefined,
      blur: false
    },
    showZarium: false,
    groups: null as any,
    accountbar: null as any
  }),
  actions: {
    showZariumView() {
      this.showZarium = true;
    },
    setGroups(groups: any) {
      this.groups = markRaw(groups);
    },
    setAccountbar(accountbar: any) {
      this.accountbar = markRaw(accountbar);
    },
    setSuperadmin(status: boolean) {
      this.superadmin = status;
    },
    setModal(component: any) {
      this.modal = markRaw(component);
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
      setTimeout(() => {
        this.modal = null;
      }, 300);
    },
    addNotification(notification: any) {
      const id = notification.id || Math.random().toString(36).substring(7);
      const duration = notification.duration ?? 5000;
      this.notifications.push({ ...notification, id, closing: false });

      if (duration > 0) {
        setTimeout(() => {
          this.closeNotification(id);
        }, duration);
      }
    },
    closeNotification(id: string) {
      const n = this.notifications.find(x => x.id === id);
      if (n) {
        n.closing = true;
        setTimeout(() => {
          this.notifications = this.notifications.filter(x => x.id !== id);
        }, 300);
      }
    },
    setBackground(options: any) {
      this.background = { ...this.background, ...options };
    }
  }
});
