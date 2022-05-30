import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from 'puppeteer';
import Profile from './Profile';
declare type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
};
export default class TiktokScraper {
    puppeteerOptions: PuppeteerOptions;
    getProfile(username: string): Promise<Profile>;
}
export {};
