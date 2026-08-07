import { useEditStore } from '../../stores/editstore';

export function getSelectedEdit() {
    return useEditStore.getState().selectedEdit;
}
