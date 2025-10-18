import { createPagesFunctionHandler } from '@react-router/cloudflare';
import type { ServerBuild } from 'react-router';

import * as build from '../build/server';

export const onRequest = createPagesFunctionHandler({
  build: build as unknown as ServerBuild,
});
