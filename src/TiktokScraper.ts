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

    async solvePuzzleCaptcha(outerImageLink: string, innerImageLink: string): Promise<number> // Return degree value to spin
    {
        throw Error('Puzzle Captcha solver not implemented for these links : ' + outerImageLink + ' ' + innerImageLink)
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

            await page.waitForTimeout(10000)
            
            const videoThumbnailSelector = '[data-e2e="user-post-item"]'
            const videoThumbnailElements = await page.$$(videoThumbnailSelector);

            const captchaVerificationBarSelector = '.captcha_verify_bar'
            const captchaVerificationBar = await page.$(captchaVerificationBarSelector)

            if (captchaVerificationBar) {
                const captchaVerificationBarText = await captchaVerificationBar.evaluate(captchaVerificationBar => captchaVerificationBar.textContent)
                
                if (captchaVerificationBarText && captchaVerificationBarText.includes('puzzle')) {
                    const [outerImageLink, innerImageLink] = await captchaVerificationBar.evaluate(captchaVerificationBar => {
                        const captchaVerificationContainer = captchaVerificationBar.nextElementSibling

                        if (! captchaVerificationContainer) {
                            return [null, null]
                        }

                        const outerImageLinkElementSelector = '[data-testid="whirl-outer-img"]'

                        const outerImageElement = captchaVerificationContainer.querySelector(outerImageLinkElementSelector)

                        if (! outerImageElement) {
                            return [null, null]
                        }

                        const outerImageLink = outerImageElement.getAttribute('src')

                        if (! outerImageLink) {
                            return [null, null]
                        }

                        const innerImageLinkElementSelector = '[data-testid="whirl-inner-img"]'

                        const innerImageElement = captchaVerificationContainer.querySelector(innerImageLinkElementSelector)

                        if (! innerImageElement) {
                            return [null, null]
                        }

                        const innerImageLink = innerImageElement.getAttribute('src')

                        if (! innerImageLink) {
                            return [null, null]
                        }

                        return [outerImageLink, innerImageLink]
                    })

                    if (! outerImageLink || ! innerImageLink) {
                        await browser.close()
                        throw Error('Puzzle captcha required but couldn\'t find the links')
                    }

                    try {
                        const degreeValueToSpin = await this.solvePuzzleCaptcha(outerImageLink, innerImageLink)
                    } catch (e) {
                        await browser.close()
                        throw e
                    }

                } else {
                    await browser.close()
                    throw Error('Unknown captcha required')
                }
            }

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
