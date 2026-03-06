import orchestrator from "tests/orchestrator"
import activation from "models/activation"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  await orchestrator.clearDatabase()
  await orchestrator.runPendingMigrations()
  await orchestrator.deleteAllEmails()
})

describe("User case: Registration flow (all successful)", () => {
  let createUserResponseBody

  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "registrationFlow",
          email: "registration-flow@curso.dev",
          password: "RegistrationFlowPassword",
        }),
      },
    )

    expect(createUserResponse.status).toBe(201)

    createUserResponseBody = await createUserResponse.json()

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "registrationFlow",
      email: "registration-flow@curso.dev",
      password: createUserResponseBody.password,
      features: ["read:activation_code"],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    })
  })

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail()

    const activationToken = await activation.findOneByUserId(
      createUserResponseBody.id,
    )

    expect(lastEmail.sender).toBe("<contato@kazlunews.com.br>")
    expect(lastEmail.recipients[0]).toBe("<registration-flow@curso.dev>")
    expect(lastEmail.subject).toBe("Ative seu cadastro no KazluNews")
    expect(lastEmail.text).toContain("registrationFlow")
    expect(lastEmail.text).toContain(activationToken.id)
  })

  test("Activate account", async () => {})

  test("Login", async () => {})

  test("Get user information", async () => {})
})
