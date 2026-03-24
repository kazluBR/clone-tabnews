import orchestrator from "tests/orchestrator"
import webserver from "infra/webserver"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
})

describe("ANY /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    const notAllowedMethods = ["PUT", "PATCH", "DELETE", "OPTIONS"]

    test.each(notAllowedMethods)(
      "Returning 405 for %s method",
      async (method) => {
        const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method,
        })

        expect(response.status).toBe(405)

        const responseBody = await response.json()

        expect(responseBody).toEqual({
          name: "MethodNotAllowedError",
          message: "Método não permitido para este endpoint.",
          action:
            "Verifique se o método HTTP enviado é válido para este endpoint.",
          status_code: 405,
        })
      },
    )
  })
})
