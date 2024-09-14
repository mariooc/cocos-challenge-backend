import dotenv from 'dotenv';
import { cleanEnv, port, str, testOnly } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly('local'),
    choices: ['development', 'production', 'local'],
  }),
  PORT: port({ devDefault: testOnly(3000) }),
  DB_HOST: str({ desc: 'Host for the postgres database' }),
  DB_PORT: port({ desc: 'Port for the postgres database' }),
  DB_PASS: str({
    desc: 'Password for the postgres user',
  }),
  DB_USER: str({ desc: 'User for the postgres database' }),
  DB_DB: str({ desc: 'Database for the postgres database' }),
});
