import { createORPCClient } from '@orpc/client';
import { ResponseValidationPlugin } from '@orpc/contract/plugins';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { Contract } from '@packages/contract';
import type { ContractRouterClient } from '@orpc/contract';
import { decodeApiError } from '@/utils/decode-api-error';

const resolveApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3200`;
  }

  return 'http://localhost:3200';
};

const link = new OpenAPILink(Contract, {
  url: resolveApiUrl(),
  customErrorResponseBodyDecoder: decodeApiError,
  plugins: [new ResponseValidationPlugin(Contract)],
});

const client: ContractRouterClient<typeof Contract> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
