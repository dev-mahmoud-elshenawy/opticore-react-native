import { api } from '../../src/facades/api';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { HttpMethod } from '../../src/infrastructure';
import type { ApiResponse } from '../../src/infrastructure/network/ApiResponse';

const payload = [{ id: '1', name: 'Ali' }];
const fakeResponse: ApiResponse<unknown> = { data: payload, status: 200, headers: {}, config: {} };

describe('api facade — verbs return the response body and forward to request()', () => {
  let requestSpy: jest.SpyInstance;

  beforeEach(() => {
    requestSpy = jest
      .spyOn(ApiClient.getInstance(), 'request')
      .mockResolvedValue(fakeResponse as never);
  });
  afterEach(() => jest.restoreAllMocks());

  it('get → GET, returns body, forwards config', async () => {
    const result = await api.get('/users', { params: { page: 1 } });
    expect(result).toBe(payload);
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.GET,
      url: '/users',
      params: { page: 1 },
    });
  });

  it('delete → DELETE, returns body', async () => {
    const result = await api.delete('/users/1');
    expect(result).toBe(payload);
    expect(requestSpy).toHaveBeenCalledWith({ method: HttpMethod.DELETE, url: '/users/1' });
  });

  it('post → POST with data + config, returns body', async () => {
    const body = { name: 'a' };
    const result = await api.post('/users', body, { headers: { x: '1' } });
    expect(result).toBe(payload);
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.POST,
      url: '/users',
      data: body,
      headers: { x: '1' },
    });
  });

  it('put → PUT with data, returns body', async () => {
    await api.put('/users/1', { name: 'b' });
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.PUT,
      url: '/users/1',
      data: { name: 'b' },
    });
  });

  it('patch → PATCH with data, returns body', async () => {
    await api.patch('/users/1', { name: 'c' });
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.PATCH,
      url: '/users/1',
      data: { name: 'c' },
    });
  });

  it('propagates request() errors (inherits the init guard — no new failure mode)', async () => {
    requestSpy.mockReset();
    requestSpy.mockRejectedValueOnce(new Error('ApiClient.request called before initialization'));
    await expect(api.get('/x')).rejects.toThrow('called before initialization');
  });
});

describe('api facade — headers / interceptors / readiness delegate to ApiClient', () => {
  afterEach(() => jest.restoreAllMocks());

  it('setHeader / setHeaders / removeHeader delegate', () => {
    const client = ApiClient.getInstance();
    const setHeader = jest.spyOn(client, 'setHeader').mockImplementation(() => {});
    const setHeaders = jest.spyOn(client, 'setHeaders').mockImplementation(() => {});
    const removeHeader = jest.spyOn(client, 'removeHeader').mockImplementation(() => {});

    api.setHeader('Accept-Language', 'ar');
    api.setHeaders({ 'X-Tenant': 't1' });
    api.removeHeader('Accept-Language');

    expect(setHeader).toHaveBeenCalledWith('Accept-Language', 'ar');
    expect(setHeaders).toHaveBeenCalledWith({ 'X-Tenant': 't1' });
    expect(removeHeader).toHaveBeenCalledWith('Accept-Language');
  });

  it('onRequest / onResponse / removeInterceptor delegate', () => {
    const client = ApiClient.getInstance();
    const addReq = jest.spyOn(client, 'addRequestInterceptor').mockReturnValue(1);
    const addRes = jest.spyOn(client, 'addResponseInterceptor').mockReturnValue(2);
    const remove = jest.spyOn(client, 'removeInterceptor').mockReturnValue(true);

    const req = { onRequest: (c: never) => c };
    const res = { onResponse: (r: never) => r };
    expect(api.onRequest(req)).toBe(1);
    expect(api.onResponse(res)).toBe(2);
    expect(api.removeInterceptor(1)).toBe(true);

    expect(addReq).toHaveBeenCalledWith(req);
    expect(addRes).toHaveBeenCalledWith(res);
    expect(remove).toHaveBeenCalledWith(1);
  });

  it('isReady reflects ApiClient.isInitialized()', () => {
    jest.spyOn(ApiClient.getInstance(), 'isInitialized').mockReturnValue(true);
    expect(api.isReady()).toBe(true);
  });
});
