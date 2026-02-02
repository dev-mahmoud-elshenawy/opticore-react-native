export type ConnectivityCallback = (isConnected: boolean) => void;

export interface ConnectivityState {
  isConnected: boolean;
  type: string;
}
