import { ROUTE_PREFIXES } from '@/constants/route-prefixes.constant';

export const BASE_PATHS = {
  api: ROUTE_PREFIXES.API,
} as const;

export type BasePath = (typeof BASE_PATHS)[keyof typeof BASE_PATHS];
