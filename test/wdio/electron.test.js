import { browser } from '@wdio/globals'
import fs from 'node:fs'
import path from 'node:path'

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../', 'package.json'), { encoding: 'utf-8' }))
const { name, version } = packageJson

describe('Electron Testing', () => {
    it('should print and verify the application title ', async () => {
        let b =await browser.getTitle();
        console.log('Salut ', b)
        expect(b).toEqual("Haino")
    })

    it('should retrieve app metadata through the electron API', async () => {
        const appName = await browser.electron.app('getName')
        expect(appName).toEqual(name)
        const appVersion = await browser.electron.app('getVersion')
        expect(appVersion).toEqual(version)
      })
})

