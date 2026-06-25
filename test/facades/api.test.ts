import { api } from '../../src/facades/api';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { HttpMethod } from '../../src/infrastructure';
import type { ApiResponse } from '../../src/infrastructure/network/ApiResponse';

const fakeResponse: ApiResponse<unknown> = { data: null, status: 200, headers: {}, config: {} };

describe('api facade — verb sugar maps to request()', () => {
  let requestSpy: jest.SpyInstance;

  beforeEach(() => {
    requestSpy = jest
      .spyOn(ApiClient.getInstance(), 'request')
      .mockResolvedValue(fakeResponse as never);
  });
  afterEach(() => jest.restoreAllMocks());

  it('get → GET with passthrough config', async () => {
    await api.get('/users', { params: { page: 1 } });
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.GET,
      url: '/users',
      params: { page: 1 },
    });
  });

  it('delete → DELETE', async () => {
    await api.delete('/users/1');
    expect(requestSpy).toHaveBeenCalledWith({ method: HttpMethod.DELETE, url: '/users/1' });
  });

  it('post → POST with data + config', async () => {
    const body = { name: 'a' };
    await api.post('/users', body, { headers: { x: '1' } });
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.POST,
      url: '/users',
      data: body,
      headers: { x: '1' },
    });
  });

  it('put → PUT with data', async () => {
    await api.put('/users/1', { name: 'b' });
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.PUT,
      url: '/users/1',
      data: { name: 'b' },
    });
  });

  it('patch → PATCH with data', async () => {
    await api.patch('/users/1', { name: 'c' });
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.PATCH,
      url: '/users/1',
      data: { name: 'c' },
    });
  });

  it('request() is a pure passthrough', async () => {
    const cfg = { method: HttpMethod.GET, url: '/raw' };
    const res = await api.request(cfg);
    expect(requestSpy).toHaveBeenCalledWith(cfg);
    expect(res).toBe(fakeResponse);
  });

  it('propagates request() errors (inherits the init guard — no new failure mode)', async () => {
    requestSpy.mockReset();
    requestSpy.mockRejectedValueOnce(new Error('ApiClient.request called before initialization'));
    await expect(api.get('/x')).rejects.toThrow('called before initialization');
  });
});
