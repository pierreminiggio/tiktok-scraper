"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TiktokScraper_1 = __importDefault(require("./TiktokScraper"));
const args = process.argv;
const argsLength = args.length;
if (argsLength < 3) {
    console.log('Use like this : node dist/cli.js <username>');
    process.exit();
}
const username = args[2];
(async () => {
    const api = new TiktokScraper_1.default();
    const profile = await api.getProfile(username);
    console.log(JSON.stringify(profile));
})();
