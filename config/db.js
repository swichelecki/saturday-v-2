import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let cached = mongoose || { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGO_URI) throw new Error('MONGO_URI is missing');

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGO_URI, {
      dbName: 'saturday_db',
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  console.log('MongoDB Connected');

  return cached.conn;
};

export default connectDB;
