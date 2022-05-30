import TiktokScraper from './TiktokScraper';

const args = process.argv
const argsLength = args.length

if (argsLength < 3) {
    console.log('Use like this : node dist/cli.js <username>')
    process.exit()
}

const username = args[2];

(async() => {
    const api = new TiktokScraper()

    const profile = await api.getProfile(username)
    console.log(profile)
})()
