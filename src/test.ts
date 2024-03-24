import TiktokScraper from './TiktokScraper';

(async() => {
    const api = new TiktokScraper()
    api.puppeteerOptions.headless = false

    try {
        const profile = await api.getProfile('pierreminiggio')
        console.log(JSON.stringify(profile))
    } catch (e) {
        console.log(e)
    }
})()
