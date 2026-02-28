import email from "infra/email"
import orchestrator from "tests/orcherstrator"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
})

describe("infra/email", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails()

    await email.send({
      from: "KazluNews <contato@kazlunews.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    })

    await email.send({
      from: "KazluNews <contato@kazlunews.com.br>",
      to: "contato@curso.dev",
      subject: "Último email enviado",
      text: "Corpo do útlimo email.",
    })

    const lastEmail = await orchestrator.getLastEmail()
    expect(lastEmail.sender).toBe("<contato@kazlunews.com.br>")
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>")
    expect(lastEmail.subject).toBe("Último email enviado")
    expect(lastEmail.text).toBe("Corpo do útlimo email.\r\n")
  })
})
