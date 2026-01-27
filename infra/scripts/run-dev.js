const { spawn, exec } = require("node:child_process")

spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
})

let cleaning = false

function cleanup() {
  if (cleaning) return
  cleaning = true

  exec("npm run services:stop", { stdio: "inherit" }, () => {
    process.exit(0)
  })
}

process.on("SIGINT", cleanup)
process.on("SIGTERM", cleanup)
