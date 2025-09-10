import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hivis.vending',
  appName: 'Hi-Vis Vending',
  webDir: 'dist',
  server: {
    url: 'http://192.168.68.50:3000',
    cleartext: true
  }
};

export default config;
