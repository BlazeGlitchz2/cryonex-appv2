import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";
import { Dialog } from "@capacitor/dialog";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";

export class UpdateService {
  private convex: ConvexReactClient;

  constructor(convexClient: ConvexReactClient) {
    this.convex = convexClient;
  }

  async checkForUpdates() {
    try {
      const platform = Capacitor.getPlatform();

      if (platform === "web") {
        return;
      }

      const deviceInfo = await Device.getInfo();
      if (deviceInfo.isVirtual) {
        console.log("Skipping OTA update check on virtual devices");
        return;
      }

      const { version } = await App.getInfo();
      const update = await this.convex.query(api.updates.latestVersion, {
        platform: platform as "ios" | "android",
        currentVersion: version,
      });

      if (update) {
        console.log("Update available:", update);
        const { value } = await Dialog.confirm({
          title: "Update Available",
          message: `A new version (${update.version}) is available. ${update.notes || ""}\nWould you like to download and restart?`,
          okButtonTitle: "Update Now",
          cancelButtonTitle: "Later",
        });

        if (value) {
          await this.performUpdate(update.url, update.version);
        }
      } else {
        console.log("No updates available");
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }

  private async performUpdate(url: string, version: string) {
    try {
      const versionedId = version;
      console.log("Downloading update...", url);

      const download = await CapacitorUpdater.download({
        url,
        version: versionedId,
      });

      console.log("Download complete", download);
      await CapacitorUpdater.set({ id: versionedId });
    } catch (error) {
      console.error("Update failed:", error);
      await Dialog.alert({
        title: "Update Failed",
        message: "Could not apply the update. Please try again later.",
      });
    }
  }
}
