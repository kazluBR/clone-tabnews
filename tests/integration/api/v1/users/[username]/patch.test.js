import { version as uuidVersion } from "uuid"
import orchestrator from "tests/orchestrator"
import user from "models/user"
import password from "models/password"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  await orchestrator.clearDatabase()
  await orchestrator.runPendingMigrations()
})

describe("Patch /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser()

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      )

      expect(response.status).toBe(403)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "update:user"',
        status_code: 403,
      })
    })
  })

  describe("Default user", () => {
    test("With nonexistent 'username'", async () => {
      const createdUser = await orchestrator.createUser()
      await orchestrator.activateUser(createdUser.id)

      const sessionObject = await orchestrator.createSession(createdUser.id)

      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      )

      expect(response.status).toBe(404)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      })
    })

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      })

      const createUser2 = await orchestrator.createUser({
        username: "user2",
      })

      await orchestrator.activateUser(createUser2.id)
      const sessionObject2 = await orchestrator.createSession(createUser2.id)

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject2.token}`,
        },
        body: JSON.stringify({
          username: "user1",
        }),
      })

      expect(response.status).toBe(400)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      })
    })

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@curso.dev",
      })

      const createdUser = await orchestrator.createUser({
        email: "email2@curso.dev",
      })

      await orchestrator.activateUser(createdUser.id)
      const sessionObject = await orchestrator.createSession(createdUser.id)

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "email1@curso.dev",
          }),
        },
      )

      expect(response.status).toBe(400)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      })
    })

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newPassword1",
      })

      await orchestrator.activateUser(createdUser.id)
      const sessionObject = await orchestrator.createSession(createdUser.id)

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })

      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

      expect(responseBody.updated_at > responseBody.created_at).toBe(true)

      const userInDatabase = await user.findOneByUsername(createdUser.username)
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      )

      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      )

      expect(correctPasswordMatch).toBe(true)
      expect(incorrectPasswordMatch).toBe(false)
    })

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser()

      await orchestrator.activateUser(createdUser.id)
      const sessionObject = await orchestrator.createSession(createdUser.id)

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })
    })

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser()

      await orchestrator.activateUser(createdUser.id)
      const sessionObject = await orchestrator.createSession(createdUser.id)

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "uniqueEmail2@curso.dev",
          }),
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })
    })

    test("With `userB` targeting `userA`", async () => {
      const userA = await orchestrator.createUser()

      const userB = await orchestrator.createUser()

      await orchestrator.activateUser(userB.id)
      const sessionObjectB = await orchestrator.createSession(userB.id)

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userA.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObjectB.token}`,
          },
          body: JSON.stringify({
            username: "userC",
          }),
        },
      )

      expect(response.status).toBe(403)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para atualizar outro usuário.",
        action:
          "Verifique se você possui a feature necessária para atualizar outro usuário.",
        status_code: 403,
      })
    })
  })

  describe("Privileged user", () => {
    test("With `update:user:others` targeting `defaultUser`", async () => {
      const defaultUser = await orchestrator.createUser()

      const privilegedUser = await orchestrator.createUser()

      const activatedPrivilegedUser = await orchestrator.activateUser(
        privilegedUser.id,
      )
      await orchestrator.addFeaturesToUser(activatedPrivilegedUser, [
        "update:user:others",
      ])

      const privilegedUserSession = await orchestrator.createSession(
        activatedPrivilegedUser.id,
      )

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${privilegedUserSession.token}`,
          },
          body: JSON.stringify({
            username: "AlteradoPorPrivilegiado",
          }),
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: defaultUser.id,
        username: "AlteradoPorPrivilegiado",
        features: defaultUser.features,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })

      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

      expect(responseBody.updated_at > responseBody.created_at).toBe(true)
    })
  })
})
