"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
class TiktokScraper {
    constructor() {
        this.puppeteerOptions = {
            args: ['--no-sandbox']
        };
    }
    async solvePuzzleCaptcha(outerImageLink, innerImageLink) {
        throw Error('Puzzle Captcha solver not implemented for these links : ' + outerImageLink + ' ' + innerImageLink);
    }
    async getProfile(username) {
        let browser;
        try {
            browser = await puppeteer_1.default.launch(this.puppeteerOptions);
        }
        catch (browserLaunchError) {
            throw browserLaunchError;
        }
        try {
            const pages = await browser.pages();
            const page = pages.length > 0 ? pages[0] : await browser.newPage();
            const tiktokProfileUrl = 'https://www.tiktok.com/@' + username;
            await page.goto(tiktokProfileUrl);
            await page.waitForTimeout(10000);
            const videoThumbnailSelector = '[data-e2e="user-post-item"]';
            const videoThumbnailElements = await page.$$(videoThumbnailSelector);
            const captchaVerificationBarSelector = '.captcha_verify_bar';
            const captchaVerificationBar = await page.$(captchaVerificationBarSelector);
            if (captchaVerificationBar) {
                const captchaVerificationBarText = await captchaVerificationBar.evaluate(captchaVerificationBar => captchaVerificationBar.textContent);
                if (captchaVerificationBarText && captchaVerificationBarText.includes('puzzle')) {
                    const [outerImageLink, innerImageLink] = await captchaVerificationBar.evaluate(captchaVerificationBar => {
                        const captchaVerificationContainer = captchaVerificationBar.nextElementSibling;
                        if (!captchaVerificationContainer) {
                            return [null, null];
                        }
                        const outerImageLinkElementSelector = '[data-testid="whirl-outer-img"]';
                        const outerImageElement = captchaVerificationContainer.querySelector(outerImageLinkElementSelector);
                        if (!outerImageElement) {
                            return [null, null];
                        }
                        const outerImageLink = outerImageElement.getAttribute('src');
                        if (!outerImageLink) {
                            return [null, null];
                        }
                        const innerImageLinkElementSelector = '[data-testid="whirl-inner-img"]';
                        const innerImageElement = captchaVerificationContainer.querySelector(innerImageLinkElementSelector);
                        if (!innerImageElement) {
                            return [null, null];
                        }
                        const innerImageLink = innerImageElement.getAttribute('src');
                        if (!innerImageLink) {
                            return [null, null];
                        }
                        return [outerImageLink, innerImageLink];
                    });
                    if (!outerImageLink || !innerImageLink) {
                        await browser.close();
                        throw Error('Puzzle captcha required but couldn\'t find the links');
                    }
                    try {
                        const degreeValueToSpin = await this.solvePuzzleCaptcha(outerImageLink, innerImageLink);
                    }
                    catch (e) {
                        await browser.close();
                        throw e;
                    }
                }
                else {
                    await browser.close();
                    throw Error('Unknown captcha required');
                }
            }
            const videos = [];
            for (const videoThumbnailElement of videoThumbnailElements) {
                const url = await videoThumbnailElement.evaluate(videoThumbnailElement => { var _a; return (_a = videoThumbnailElement.querySelector('a')) === null || _a === void 0 ? void 0 : _a.href; });
                if (!url) {
                    continue;
                }
                if (!url.includes(tiktokProfileUrl + '/video/')) {
                    continue;
                }
                const legend = await videoThumbnailElement.evaluate(videoThumbnailElement => { var _a; return (_a = videoThumbnailElement.nextSibling) === null || _a === void 0 ? void 0 : _a.innerText; });
                if (!legend) {
                    continue;
                }
                videos.push({ id: url.split('/').slice(-1)[0], url, legend });
            }
            await browser.close();
            return { videos: videos.reverse() };
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
}
exports.default = TiktokScraper;
