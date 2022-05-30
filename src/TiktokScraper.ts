import puppeteer, { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Page, Product } from 'puppeteer'
import Profile from './Profile';
import Video from './Video';

type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
}

export default class TiktokScraper {

    public puppeteerOptions: PuppeteerOptions = {
        args: ['--no-sandbox']
    }

    async getProfile(username: string): Promise<Profile>
    {
        let browser: Browser

        try {
            browser = await puppeteer.launch(this.puppeteerOptions)
        } catch (browserLaunchError: any) {
            throw browserLaunchError;
        }

        try {
            const pages = await browser.pages()
            const page = pages.length > 0 ? pages[0] : await browser.newPage()

            const tiktokProfileUrl = 'https://www.tiktok.com/@' + username
            await page.goto(tiktokProfileUrl)
            
            const videoThumbnailSelector = '[data-e2e="user-post-item"]'

            const videoThumbnailElements = await page.$$(videoThumbnailSelector);

            const videos: Video[] = []

            for (const videoThumbnailElement of videoThumbnailElements) {
                const url = await videoThumbnailElement.evaluate(
                    videoThumbnailElement => videoThumbnailElement.querySelector('a')?.href
                )

                if (! url) {
                    continue
                }

                if (! url.includes(tiktokProfileUrl + '/video/')) {
                    continue
                }

                const legend = await videoThumbnailElement.evaluate(
                    videoThumbnailElement => (videoThumbnailElement.nextSibling as HTMLElement)?.innerText
                )

                if (! legend) {
                    continue
                }

                videos.push({id: url.split('/').slice(-1)[0], url, legend})
            }

            await browser.close()

            return {videos: videos.reverse()}

        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError;
        }
    }
}
