import { api } from '../../src/facades/api';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { HttpMethod } from '../../src/infrastructure';
import type { ApiResponse } from '../../src/infrastructure/network/ApiResponse';

const payload = [{ id: '1', name: 'Ali' }];
const fakeResponse: ApiResponse<unknown> = { data: payload, status: 200, headers: {}, config: {} };

describe('api.data — unwrapped surface', () => {
  let requestSpy: jest.SpyInstance;

  beforeEach(() => {
    requestSpy = jest
      .spyOn(ApiClient.getInstance(), 'request')
      .mockResolvedValue(fakeResponse as never);
  });
  afterEach(() => jest.restoreAllMocks());

  it('get resolves to response.data (not the wrapper) and forwards GET + config', async () => {
    const result = await api.data.get('/users', { params: { page: 1 } });
    expect(result).toBe(payload);
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.GET,
      url: '/users',
      params: { page: 1 },
    });
  });

  it('delete unwraps + forwards DELETE', async () => {
    const r = await api.data.delete('/users/1');
    expect(r).toBe(payload);
    expect(requestSpy).toHaveBeenCalledWith({ method: HttpMethod.DELETE, url: '/users/1' });
  });

  it('post unwraps + forwards data + config', async () => {
    const body = { name: 'a' };
    const r = await api.data.post('/users', body, { headers: { x: '1' } });
    expect(r).toBe(payload);
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.POST,
      url: '/users',
      data: body,
      headers: { x: '1' },
    });
  });

  it('put unwraps + forwards data', async () => {
    await api.data.put('/users/1', { name: 'b' });
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.PUT,
      url: '/users/1',
      data: { name: 'b' },
    });
  });

  it('patch unwraps + forwards data', async () => {
    await api.data.patch('/users/1', { name: 'c' });
    expect(requestSpy).toHaveBeenCalledWith({
      method: HttpMethod.PATCH,
      url: '/users/1',
      data: { name: 'c' },
    });
  });

  it('forwards identical request args to its api.* counterpart (parity)', async () => {
    await api.get('/p', { params: { a: 1 } });
    const argsForGet = requestSpy.mock.calls.at(-1);

    requestSpy.mockClear();
    await api.data.get('/p', { params: { a: 1 } });
    const argsForDataGet = requestSpy.mock.calls.at(-1);

    expect(argsForDataGet).toEqual(argsForGet);
  });
});
