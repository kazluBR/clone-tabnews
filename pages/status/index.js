import useSWR from "swr"

async function fetchAPI(key) {
  const response = await fetch(key)
  const responseBody = response.json()
  return responseBody
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  )
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  })

  let updated_at = "Carregando..."

  if (!isLoading && data) {
    updated_at = new Date(data.updated_at).toLocaleString("pt-BR")
  }

  return <div>Última atualização: {updated_at}</div>
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  })

  let databaseStatusInformation = "Carregando..."

  if (!isLoading || data) {
    const dbData = data.dependencies.database
    const availableConnections =
      dbData.max_connections - dbData.opened_connections

    const greenCircleStyle = {
      padding: "0 8px",
      borderRadius: "100px",
      border: "2px solid #16a34a",
      color: "#16a34a",
    }

    databaseStatusInformation = (
      <div>
        <div>
          Conexões disponíveis:{" "}
          <span style={greenCircleStyle}>{availableConnections}</span>
        </div>

        <div>
          Conexões abertas:{" "}
          <span style={greenCircleStyle}>{dbData.opened_connections}</span>
        </div>

        <div>
          Versão do PostgreSQL:{" "}
          <span style={greenCircleStyle}>{dbData.version}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <h2>Database</h2>
      <div>{databaseStatusInformation}</div>
    </>
  )
}
