import { NextResponse } from 'next/server'
import fs from 'fs'
import os from 'os'
import path from 'path'

interface AppsJson {
  [key: string]: { oauth_token: string; user?: string }
}

interface HostsJson {
  'github.com'?: { oauth_token: string; user?: string }
}

export const runtime = 'nodejs'

export async function GET() {
  const configDir = path.join(os.homedir(), '.config', 'github-copilot')

  // Try apps.json first (github-copilot-cli, neovim plugin)
  const appsPath = path.join(configDir, 'apps.json')
  if (fs.existsSync(appsPath)) {
    try {
      const apps = JSON.parse(fs.readFileSync(appsPath, 'utf-8')) as AppsJson
      const entries = Object.values(apps)
      if (entries.length > 0 && entries[0].oauth_token) {
        return NextResponse.json({ token: entries[0].oauth_token, source: 'apps.json' })
      }
    } catch { /* fall through */ }
  }

  // Try hosts.json (neovim copilot.vim)
  const hostsPath = path.join(configDir, 'hosts.json')
  if (fs.existsSync(hostsPath)) {
    try {
      const hosts = JSON.parse(fs.readFileSync(hostsPath, 'utf-8')) as HostsJson
      const token = hosts['github.com']?.oauth_token
      if (token) {
        return NextResponse.json({ token, source: 'hosts.json' })
      }
    } catch { /* fall through */ }
  }

  return NextResponse.json({ token: null, source: null })
}
