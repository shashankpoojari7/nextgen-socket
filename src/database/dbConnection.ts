import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if(connection.isConnected) {
    console.log("\x1b[32m%s\x1b[0m","✅ Database is already connected!")
    return
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI!)
    connection.isConnected = db.connections[0].readyState
    
    console.log("\x1b[32m%s\x1b[0m","✅ Database successfully connected!")
  } catch (error: any) {
    console.error("\x1b[31m%s\x1b[0m", "❌ Database connection failed:", error);
    process.exit(1);
  }
}

export default dbConnect