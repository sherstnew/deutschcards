import "server-only"
import { MongoClient, Db } from "mongodb"

const dbName = process.env.MONGODB_DB || "deutschcards"

const globalForMongo = global as unknown as {
  mongoClientPromise?: Promise<MongoClient>
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not configured")

  // reuse promise if it already exists (works in BOTH dev and prod)
  if (globalForMongo.mongoClientPromise) {
    return globalForMongo.mongoClientPromise
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,                 // Ограничиваем пул соединений
    serverSelectionTimeoutMS: 5000,   // Не ждем более 5 сек при обрыве сети
    socketTimeoutMS: 45000,          // Таймаут для закрытия неактивных сокетов
    connectTimeoutMS: 10000,
  })

  const clientPromise = client.connect().catch((err) => {
    // Сбрасываем кэш при ошибке подключения, чтобы следующий запрос попытался переподключиться
    globalForMongo.mongoClientPromise = undefined
    throw err
  })

  globalForMongo.mongoClientPromise = clientPromise
  return clientPromise
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db(dbName)
}