import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as readline from 'readline';
// Carregar credenciais
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Função para obter novo token
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

rl.question('Enter the code from that page here: ', (code) => {
rl.close();
oAuth2Client.getToken(code, (err, token) => {
if (err) return console.error('Error retrieving access token', err);
oAuth2Client.setCredentials(token!);
fs.writeFileSync('token.json', JSON.stringify(token));
callback(oAuth2Client);
});
});
}

// Função para autenticar e chamar APIs
function authorize(callback: Function) {
fs.readFile('token.json', (err, token) => {
if (err) return getNewToken(oAuth2Client, callback);
oAuth2Client.setCredentials(JSON.parse(token.toString()));
callback(oAuth2Client);
});
}

// Função para acessar Google Sheets
function accessGoogleSheets(auth: OAuth2Client) {
const sheets = google.sheets({ version: 'v4', auth });
sheets.spreadsheets.values.get({
spreadsheetId: 'your-spreadsheet-id',
range: 'Sheet1!A1:D5',
}, (err, res) => {
if (err) return console.log('The API returned an error: ' + err);
const rows = res.data.values;
if (rows && rows.length) {
console.log('Data from Google Sheets:');
console.log(rows);
} else {

console.log('No data found.');
}
});
}

// Função para acessar Google Calendar
function accessGoogleCalendar(auth: OAuth2Client) {
const calendar = google.calendar({ version: 'v3', auth });
calendar.events.list({
calendarId: 'primary',
timeMin: (new Date()).toISOString(),
maxResults: 10,
singleEvents: true,
orderBy: 'startTime',
}, (err, res) => {
if (err) return console.log('The API returned an error: ' + err);
const events = res.data.items;
if (events && events.length) {

console.log('Upcoming events:');
events.map((event, i) => {
const start = event.start?.dateTime || event.start?.date