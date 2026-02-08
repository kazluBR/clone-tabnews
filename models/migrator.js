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

const defaultMigrationOptions = {
  dryRun: true,
  dir: join("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
}

async function listPendingMigrations() {
  let dbClient
  try {
    const migrationRunner = await getMigrationRunner()

    dbClient = await database.getNewClient()

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    })
    return pendingMigrations
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await dbClient?.end()
  }
}

async function runPendingMigrations() {
  let dbClient
  try {
    const migrationRunner = await getMigrationRunner()

    dbClient = await database.getNewClient()

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    })

    return pendingMigrations
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await dbClient?.end()
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
}

export default migrator
