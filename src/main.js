const fs = require('fs')
const { exec } = require('child_process')
const core = require('@actions/core')

const readHostsFromFile = filePath => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const ips = []

  lines.forEach(line => {
    const match = line.match(/ansible_host=([\d.]+)/)
    if (match && match[1]) {
      ips.push(match[1])
    }
  })

  return ips
}

const checkSSHAvailability = (ip, callback) => {
  exec(`nc -z -v -w5 ${ip} 22`, error => {
    callback(!error)
  })
}

const waitForSSHAvailability = async (ip, maxRetryTime, intervalTime) => {
  return new Promise((resolve, reject) => {
    let elapsedTime = 0

    const interval = setInterval(() => {
      checkSSHAvailability(ip, isAvailable => {
        if (isAvailable) {
          clearInterval(interval)
          resolve(true)
        }
      })

      elapsedTime += intervalTime

      if (elapsedTime >= maxRetryTime) {
        clearInterval(interval)
        reject(new Error(`the host ${ip} is still unavailable.`))
      }
    }, intervalTime)
  })
}

const run = async () => {
  try {
    const hostsFilePath = core.getInput('hosts_file_path')
    const checkInterval = core.getInput('check_interval')
    const maxRetryTime = core.getInput('max_retry_time')
    const ips = readHostsFromFile(hostsFilePath)
    const promises = ips.map(ip =>
      waitForSSHAvailability(ip, maxRetryTime, checkInterval)
    )
    await Promise.all(promises)
    console.log('All hosts are reachable.')
    process.exit(0)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = {
  run
}
