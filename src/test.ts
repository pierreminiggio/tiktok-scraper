import TiktokScraper from './TiktokScraper';

(async() => {
    const api = new TiktokScraper()
    api.puppeteerOptions.headless = false

    const profile = await api.getProfile('pierreminiggio')
    console.log(profile)
})()
