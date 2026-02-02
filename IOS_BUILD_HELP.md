# 🍎 How to Build an iOS App Without a Mac (Beginner's Guide)

Since you are on Windows, we cannot use Xcode directly. Instead, we use **GitHub Actions**, which gives us a **"Cloud Mac"** (Virtual Machine) to build the app for us.

---

## 🚫 Important: About "Tria.ge"
You mentioned using `tria.ge`.
*   **What it is:** Tria.ge is a **malware sandbox**. It is designed to safely run viruses.
*   **Why it won't work:** It resets every few minutes and deletes all files. You cannot save your work or compile an app there.
*   **The Better Alternative:** **Tmate**. This tool lets you "log in" to the GitHub Actions Cloud Mac and control it like a real computer (using the terminal). Instructions are below! 👇

---

## ✅ Phase 1: The "Impossible" Part (Certificates)
To install an app on an iPhone, Apple **requires** a digital signature. This is the only part that is hard without a Mac.

You need three things from the [Apple Developer Portal](https://developer.apple.com/):
1.  **Apple Developer Account** ($99/year).
2.  **Distribution Certificate (.p12)**: Your digital ID.
3.  **Provisioning Profile (.mobileprovision)**: A permission slip that says "This app can run on these phones".

### How to get these without a Mac:
Since you don't have a Mac to generate the "Certificate Signing Request", you have two options:
1.  **Easiest:** Ask a friend with a Mac to spend 5 minutes generating a `.p12` file for you.
2.  **Service:** Use a cloud service like [MacInCloud](https://www.macincloud.com/) ($20/mo, cancel after 1 month) or [ODWM](https://www.oakhost.net/) to log in to a real Mac remotely and export your certs.
3.  **Hard Mode:** Use complex OpenSSL commands on Windows (Not recommended for beginners).

**Once you have these files (`cert.p12` and `app.mobileprovision`), you are ready!**

---

## ☁️ Phase 2: Setting up the Cloud Builder
We need to give your "Cloud Mac" (GitHub Actions) access to your certificates so it can sign the app.

1.  **Go to your GitHub Repository**.
2.  Click **Settings** -> **Secrets and variables** -> **Actions**.
3.  Click **New repository secret** and add these:

| Secret Name | Value |
| :--- | :--- |
| `BUILD_CERTIFICATE_BASE64` | The content of your `.p12` file converted to Base64 code. |
| `P12_PASSWORD` | The password you set for the `.p12` file. |
| `BUILD_PROVISION_PROFILE_BASE64` | The content of your `.mobileprovision` file converted to Base64 code. |
| `KEYCHAIN_PASSWORD` | Set this to any random password (e.g., `secret123`). |

> **How to get Base64?**
> On Windows, open PowerShell and run:
> `[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\your\file.p12"))`
> Copy the huge block of text it spits out. That is your secret.

---

## 💻 Phase 3: The "Virtual Mac" (Debugging with Tmate)
If you want to "log in" to the builder to fix errors or explore, we use **Tmate**.

### How to use it:
1.  Open `.github/workflows/ios-build.yml`.
2.  Add this step where you want the build to "pause" and let you in:

```yaml
- name: 🔍 Debug with Tmate (Virtual Mac Access)
  uses: mxschmitt/action-tmate@v3
```

3.  Commit and push.
4.  Go to the **Actions** tab on GitHub.
5.  Click the running workflow.
6.  Look at the logs for the "Debug with Tmate" step. It will show an SSH command like:
    `ssh poiu987@nyc1.tmate.io`
7.  Copy that command into your Windows PowerShell. **You are now inside the Cloud Mac!** 🖥️

---

## 🚀 Phase 4: Getting your App (.ipa)
Once everything is set up:
1.  Make a change to your code and push to `main`.
2.  Wait ~15-20 minutes.
3.  Go to the **Actions** tab.
4.  Download the **Artifact** named `ios-app`.
5.  Upload that `.ipa` file to [Transporter](https://apps.apple.com/us/app/transporter/id1450874784) (if you have access) or install it via standard distribution methods.
