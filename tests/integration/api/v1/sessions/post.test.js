import { version as uuidVersion } from "uuid"
import * as cookie from "cookie"
import orcherstrator from "tests/orcherstrator"
import session from "models/session"

beforeAll(async () => {
  await orcherstrator.waitForAllServices()
  await orcherstrator.clearDatabase()
  await orcherstrator.runPendingMigrations()
})

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orcherstrator.createUser({
        password: "senha-correta",
      })

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@curso.dev",
          password: "senha-correta",
        }),
      })

      expect(response.status).toBe(401)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      })
    })

    test("With correct `email` but incorrect `password`", async () => {
      await orcherstrator.createUser({
        email: "email.correto@curso.dev",
      })

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correto@curso.dev",
          password: "senha-incorreta",
        }),
      })

      expect(response.status).toBe(401)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      })
    })

    test("With incorrect `email` and incorrect `password`", async () => {
      await orcherstrator.createUser()

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.incorreto@curso.dev",
          password: "senha-incorreta",
        }),
      })

      expect(response.status).toBe(401)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      })
    })

    test("With correct `email` and correct `password`", async () => {
      const createdUser = await orcherstrator.createUser({
        email: "tudo.correto@curso.dev",
        password: "tudocorreto",
      })

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "tudo.correto@curso.dev",
          password: "tudocorreto",
        }),
      })

      expect(response.status).toBe(201)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })

      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN()
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

      const expiresAt = new Date(responseBody.expires_at)
      const createdAt = new Date(responseBody.created_at)

      expiresAt.setMilliseconds(0)
      createdAt.setMilliseconds(0)

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS)

      const setCookie = response.headers.get("set-cookie")

      expect(setCookie).toContain("session_id=")
      expect(setCookie).toContain(
        `Max-Age=${session.EXPIRATION_IN_MILLISECONDS / 1000}`,
      )
      expect(setCookie).toContain("Path=/")
      expect(setCookie).toContain("HttpOnly")

      const parsed = cookie.parse(setCookie)
      expect(parsed.session_id).toBe(responseBody.token)
    })
  })
})
