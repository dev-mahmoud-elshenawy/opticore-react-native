/**
 * Minimal type declarations for expo-router.
 * The actual types are provided by the consuming app's expo-router installation.
 */
declare module 'expo-router' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export type Href<T = string> = string | { pathname: string; params?: Record<string, unknown> };

  export interface Router {
    push(href: Href): void;
    replace(href: Href): void;
    back(): void;
    canGoBack(): boolean;
    dismissAll(): void;
  }

  export function useRouter(): Router;
}
