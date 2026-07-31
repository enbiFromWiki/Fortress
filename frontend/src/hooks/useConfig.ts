import { useAuthStore } from '../stores/authstore';

export function useConfig() {
    const config = useAuthStore((i) => i.config);
    return config;
}
