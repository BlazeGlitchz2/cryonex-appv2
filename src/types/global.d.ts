declare global {
  interface Window {
    /**
     * Navigate to the auth page with a custom redirect URL
     * @param redirectUrl - URL to redirect to after successful authentication
     */
    navigateToAuth: (redirectUrl: string) => void;
  }
}

// PrismJS module declarations to satisfy TypeScript
declare module "prismjs" {
  const Prism: any;
  export default Prism;
}
declare module "prismjs/components/*";

export {};