import { connectivity } from '../../src/facades/connectivity';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';

describe('connectivity facade', () => {
  afterEach(() => jest.restoreAllMocks());

  it('isConnected reflects the ConnectivityManager singleton', () => {
    jest.spyOn(ConnectivityManager.getInstance(), 'isConnected', 'get').mockReturnValue(false);
    expect(connectivity.isConnected).toBe(false);
  });

  it('subscribe adds a listener and returns an unsubscribe that removes it', () => {
    const manager = ConnectivityManager.getInstance();
    const add = jest.spyOn(manager, 'addListener').mockImplementation(() => {});
    const remove = jest.spyOn(manager, 'removeListener').mockImplementation(() => {});

    const cb = jest.fn();
    const unsubscribe = connectivity.subscribe(cb);
    expect(add).toHaveBeenCalledWith(cb);

    unsubscribe();
    expect(remove).toHaveBeenCalledWith(cb);
  });
});
