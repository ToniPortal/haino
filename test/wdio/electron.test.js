import { $,browser } from '@wdio/globals'
import fs from 'node:fs'
import path from 'node:path'

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../', 'package.json'), { encoding: 'utf-8' }))
const { name, version } = packageJson

describe('Electron Testing', () => {
    it('should print and verify the application title ', async () => {
        let b =await browser.getTitle();
        // console.log('Salut ', b)
        expect(b).toEqual("Haino")
    })

    it('should write to the commandInput and retrieve info message', async () => {
        await browser.waitUntil(async () => {
            const readyState = await browser.execute(() => document.readyState);
            return readyState === 'complete';
        });

        // Ensuite, écrire "/hpm" dans le champ d'entrée avec l'ID "commandInput"
        await browser.execute(() => {
            const commandInput = document.getElementById('commandInput');
            commandInput.value = "/hpm";
            const event = new Event('keyup', { bubbles: true });
            commandInput.dispatchEvent(event);
        });

        await browser.pause(1000);


        // Retrieve the content of the paragraph with id "info"
        const infoMessage = await browser.execute(() => {
            return document.getElementById('info').innerText;
        });
        console.log("INFOMESSAGE", infoMessage)

        // Assert that the retrieved message matches the expected result
        expect(infoMessage).toContain('Searching');
    });
})

