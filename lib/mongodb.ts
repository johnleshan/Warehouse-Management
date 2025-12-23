import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Please define the MONGODB_URI environment variable inside Vercel Dashboard');
    }
    // Fallback for local development only
    console.warn('MONGODB_URI not found, falling back to local MongoDB');
}

const connectionUri = MONGODB_URI || 'mongodb://localhost:27017/wms';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log('Connecting to MongoDB...');

        cached.promise = mongoose.connect(connectionUri, opts).then((mongoose) => {
            console.log('MongoDB Connected Successfully');
            return mongoose;
        }).catch((err) => {
            console.error('MongoDB Connection Error:', err.message);
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
