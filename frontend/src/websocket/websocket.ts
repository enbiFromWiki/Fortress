import { useSettingsStore } from '../stores/settingsstore';
import { Socket } from './ws';

const settings = useSettingsStore.getState().settings;
export const socket = new Socket(settings.maxEditCount, settings.wikis);
