import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const prodConfig = {
	out: './drizzle',
	schema: './src/lib/server/db/schema.ts',
	dialect: "sqlite" as const,
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!
	}
};

const devConfig = {
  schema: "./src/lib/server/db/schema.ts",
  dialect: "sqlite" as const,
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
}

export default defineConfig(process.env.DEV ? devConfig : prodConfig);
