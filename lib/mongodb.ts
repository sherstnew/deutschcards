import "server-only"

import { MongoClient } from "mongodb"

const dbName = process.env.MONGODB_DB || "deutschcards"
const globalForMongo = global as typeof globalThis & { mongoClient?: Promise<MongoClient> }

export async function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not configured")
  const clientPromise = globalForMongo.mongoClient ?? new MongoClient(uri).connect()
  if (process.env.NODE_ENV !== "production") globalForMongo.mongoClient = clientPromise
  return (await clientPromise).db(dbName)
}
