export type LifecycleCallback = () => void;

export enum LifecycleState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BACKGROUND = 'background',
}
