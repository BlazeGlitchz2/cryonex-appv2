import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { ConvexReactClient } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Dialog } from '@capacitor/dialog';
import { App } from '@capacitor/app';

export class UpdateService {
    private convex: ConvexReactClient;

    constructor(convexClient: ConvexReactClient) {
        this.convex = convexClient;
    }

    async checkForUpdates() {
        try {
            const { version } = await App.getInfo();
            const platform = (await import('@capacitor/core')).Capacitor.getPlatform();

            if (platform === 'web') {
                console.log('Skipping update check on web');
                return;
            }

            const update = await this.convex.query(api.updates.latestVersion, {
                platform: platform as "ios" | "android",
                currentVersion: version,
            });

            if (update) {
                console.log('Update available:', update);
                const { value } = await Dialog.confirm({
                    title: 'Update Available',
                    message: `A new version (${update.version}) is available. ${update.notes || ''}\nWould you like to download and restart?`,
                    okButtonTitle: 'Update Now',
                    cancelButtonTitle: 'Later',
                });

                if (value) {
                    await this.performUpdate(update.url, update.version);
                }
            } else {
                console.log('No updates available');
            }
        } catch (error) {
            console.error('Failed to check for updates:', error);
        }
    }

    private async performUpdate(url: string, version: string) {
        try {
            // 1. Download the update
            const versionedId = version; // Use version as ID
            console.log('Downloading update...', url);

            // Use Capgo to download
            const download = await CapacitorUpdater.download({
                url: url,
                version: versionedId,
            });

            console.log('Download complete', download);

            // 2. Set the new version (this might reload the app)
            await CapacitorUpdater.set({ id: versionedId });

        } catch (error) {
            console.error('Update failed:', error);
            await Dialog.alert({
                title: 'Update Failed',
                message: 'Could not apply the update. Please try again later.',
            });
        }
    }
}
