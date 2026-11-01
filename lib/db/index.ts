import mongoose from "mongoose";

import type { Mongoose } from "mongoose";

/**
 * Single cached connection, per `docs/database.md`.
 *
 * The connection promise is memoized on a module-level global so it survives
 * the module graph being re-evaluated — hot reload in development and warm
 * serverless invocations in production — instead of dialing MongoDB (and
 * exhausting the driver pool) on every call.
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not set. Add it to .env.local (see .env.example).",
  );
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// `var` is required: it is the only declaration that attaches to `globalThis`.
declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = (globalThis._mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function dbConnect(): Promise<Mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Reset so the next call retries instead of reusing a rejected promise.
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
