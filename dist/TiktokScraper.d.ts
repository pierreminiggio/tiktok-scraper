import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from 'puppeteer';
import Profile from './Profile';
declare type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
};
export default class TiktokScraper {
    puppeteerOptions: PuppeteerOptions;
    solvePuzzleCaptcha(outerImageLink: string, innerImageLink: string): Promise<number>;
    getProfile(username: string): Promise<Profile>;
}
export {};
