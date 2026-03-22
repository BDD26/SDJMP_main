import { defineConfig } from 'playwright/test'
import path from 'path'

const executablePath = path.join(
  process.env.LOCALAPPDATA || '',
  'ms-playwright',
  'chromium-1208',
  'chrome-win64',
  'chrome.exe'
)

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    launchOptions: {
      executablePath,
    },
  },
  webServer: {
    command: 'npm.cmd run dev -- --host 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
