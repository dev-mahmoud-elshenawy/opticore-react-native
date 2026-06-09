import { expectType } from 'tsd';
import { ApiClient, HttpMethod } from '../../src/index';
import type { ApiResponse } from '../../src/index';

interface User {
  id: string;
  name: string;
}

const client = ApiClient.getInstance();

// Public network API is the enum-based request() — returns ApiResponse<T>.
// (The get/post/put/delete/patch verb methods are intentionally PRIVATE — spec 028 ③ —
// which TypeScript enforces directly; accessing them off an instance is a compile error.)
expectType<Promise<ApiResponse<User[]>>>(
  client.request<User[]>({ method: HttpMethod.GET, url: '/users' })
);
expectType<Promise<ApiResponse<User>>>(
  client.request<User>({
    method: HttpMethod.POST,
    url: '/users',
    data: { name: 'Ada' },
  })
);
expectType<Promise<ApiResponse<User>>>(
  client.request<User>({ method: HttpMethod.PUT, url: '/users/1', data: { name: 'Ada' } })
);
expectType<Promise<ApiResponse<void>>>(
  client.request<void>({ method: HttpMethod.DELETE, url: '/users/1' })
);
expectType<Promise<ApiResponse<User>>>(
  client.request<User>({ method: HttpMethod.PATCH, url: '/users/1', data: { name: 'Ada' } })
);
