export const runtime = "nodejs"

import { join } from "node:path"
import database from "infra/database"

let migrationRunner

async function getMigrationRunner() {
  if (!migrationRunner) {
    const mod = await import("node-pg-migrate")
    migrationRunner = mod.runner
  }
  return migrationRunner
}

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"]
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    })
  }

  let dbClient
  try {
    const migrationRunner = await getMigrationRunner()

    dbClient = await database.getNewClient()
    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    }

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions)
      return response.status(200).json(pendingMigrations)
    }

    if (request.method === "POST") {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      })

      if (pendingMigrations.length > 0) {
        return response.status(201).json(pendingMigrations)
      }

      return response.status(200).json(pendingMigrations)
    }
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await dbClient.end()
  }
}
