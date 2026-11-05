import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const postgres = require('postgres');

export const DRIZZLE = 'DRIZZLE';

export const drizzleProvider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.get<string>(
      'DATABASE_URL',
      'postgresql://moa_user:moa_password@localhost:5432/moa_sms_db',
    );
    const sql = postgres(connectionString, { max: 10 });
    return drizzle(sql, { schema });
  },
};
