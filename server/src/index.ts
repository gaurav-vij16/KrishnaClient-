import 'dotenv/config';
import { createApp } from './app';
import { connectDatabase } from './config/db';

const port = Number(process.env.PORT ?? 4000);
const mongoUri =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/krishna-atta-chakki';
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
const app = createApp(clientUrl);

async function startServer(): Promise<void> {
  try {
    await connectDatabase(mongoUri);
  } catch {
    console.warn(
      'Starting API without a database connection; /api/health will report disconnected.',
    );
  }

  app.listen(port, () =>
    console.info(`API listening on http://localhost:${port}`),
  );
}

void startServer();
