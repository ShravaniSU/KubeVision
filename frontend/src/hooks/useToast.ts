import { useToastStore } from '../store/toastStore';

export function useToast() {
  const { addToast } = useToastStore();

  return {
    success: (message: string, title?: string) => addToast('success', message, title),
    error: (message: string, title?: string) => addToast('error', message, title),
    warning: (message: string, title?: string) => addToast('warning', message, title),
    info: (message: string, title?: string) => addToast('info', message, title),
  };
}
