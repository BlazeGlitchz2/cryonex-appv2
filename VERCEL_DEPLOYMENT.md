# Vercel Deployment Configuration

## Build Script Approval

Vercel blocks build scripts by default for security. This project requires build scripts for:

- `@tailwindcss/oxide` - **Critical** for Tailwind CSS v4 to work (without this, the UI will be completely black)
- `@tsparticles/engine` - For particle effects
- `esbuild` - Build tool
- `tesseract.js` - OCR functionality

## Solution

The following files have been configured to allow build scripts:

1. **`.npmrc`** - Allows npm/pnpm to run build scripts
2. **`vercel.json`** - Configures Vercel to not ignore scripts during install

## Additional Steps in Vercel Dashboard

If you still see the warning, you may need to:

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Build & Development Settings**
3. Under **Build Command**, ensure it's set to: `pnpm install --ignore-scripts=false && pnpm build`
4. Under **Install Command**, ensure it's set to: `pnpm install --ignore-scripts=false`

Alternatively, you can approve the build scripts in Vercel:

1. Go to your project in Vercel
2. Navigate to **Settings** → **General**
3. Look for **Build Scripts** section
4. Approve the required packages: `@tailwindcss/oxide`, `@tsparticles/engine`, `esbuild`, `tesseract.js`

## Why This Matters

If `@tailwindcss/oxide` doesn't run its build script, Tailwind CSS v4 will not compile, resulting in:

- **Completely black screen** (no styles loaded)
- No UI rendering
- Application appears broken

The `.npmrc` and `vercel.json` files should resolve this automatically, but if issues persist, use the Vercel dashboard steps above.
