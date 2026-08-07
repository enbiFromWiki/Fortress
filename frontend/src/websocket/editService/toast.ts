import { useToastStore } from '../../stores/toaststore';

export type WSEditRes = {
    status: 'error' | 'alreadygone' | 'success';
    error: string;
    type: 'response';
    id: string;
    part?: 'rollback' | 'warn';
};

export type WSError = WSEditRes & {
    status: 'error' | 'alreadygone';
};

type ToastRegularOption = {
    header: string;
    body: string;
    status?: 'error' | 'normal' | 'done';
};

export type ToastOptions = {
    loading: ToastRegularOption;
    success: ToastRegularOption;
    error: (e: WSError) => ToastRegularOption;
    delay?: number;
};

export async function withToast(
    promise: Promise<WSEditRes>,
    options: ToastOptions
) {
    console.log('TOAST USED');
    const id = crypto.randomUUID();
    const { addToast, updateToast, deleteToast } = useToastStore.getState();
    addToast({
        progress: 100 / 3,
        status: 'normal',
        id,
        ...options.loading,
    });
    try {
        await promise;
        updateToast(id, {
            progress: 100,
            status: 'done',
            ...options.success,
        });
    } catch (err) {
        const e = err as WSError;
        updateToast(id, {
            progress: 3,
            status: 'error',
            ...options.error(e),
        });
    } finally {
        setTimeout(() => deleteToast(id), options.delay ?? 4000);
    }
}
