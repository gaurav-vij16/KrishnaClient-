import mongoose from 'mongoose';

export async function connectDatabase(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.info('MongoDB connected');
  } catch (error) {
    console.error(
      'MongoDB connection failed:',
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

export function getDatabaseStatus(): 'connected' | 'disconnected' {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
