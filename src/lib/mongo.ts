import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

type MongooseGlobal = { conn: typeof mongoose | null, promise: Promise<typeof mongoose> | null };

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseGlobal | undefined;
}

let cached: MongooseGlobal = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn
  cached.promise = cached.promise || mongoose.connect(MONGODB_URI)
  cached.conn = await cached.promise
  return cached.conn
}
