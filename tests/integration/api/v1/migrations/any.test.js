import orcherstrator from "tests/orcherstrator"

beforeAll(async () => {
  await orcherstrator.waitForAllServices()
})

describe("ANY /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    const notAllowedMethods = ["PUT", "PATCH", "DELETE", "OPTIONS"]

    test.each(notAllowedMethods)(
      "Returning 405 for %s method",
      async (method) => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method,
          },
        )

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
