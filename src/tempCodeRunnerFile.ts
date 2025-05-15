function getNewToken(oAuth2Client: OAuth2Client, callback: Function) {
const authUrl = oAuth2Client.generateAuthUrl({
access_type: 'offline',
scope: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/calendar'],
});
console.log('Authorize this app by visiting this url:', authUrl);
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
});