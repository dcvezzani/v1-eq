const fs = require('fs');
const readline = require('readline');
const moment = require('moment');
const {google} = require('googleapis');
import { V1_CACHE_DIR } from '../../constants';

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';
let auth = null;

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  // authorize(JSON.parse(content), listFiles);
  // authorize(JSON.parse(content), copyFile);
  // authorize(JSON.parse(content), uploadFile);
  auth = JSON.parse(content);
});

export const createFamilyNotes = (data, callback) => {
  authorize(auth, data, uploadFile, callback);
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, data, callback, callback2) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, data, callback2);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}

function copyFile(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.copy({
    fileId: '16hu1ltUZSO6jrnRlp69zxHydQnMUZaPPZ1hQsDkWL3E',
    resource: {
      "name": "Vezzani, Dave & Juventa",
      "parents": [
        "1i-d35wdCaKKlWB9KmWx72vfXU5vAXZcH"
      ]
    },
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log(res);
  });
}

function uploadFile(auth, data, callback) {
  const drive = google.drive({version: 'v3', auth});

  let documentHtml = fs.readFileSync(`${V1_CACHE_DIR}/20180805-test.html`);
  const familyName = data.name;
  const currentDate = moment().format('M/D');
  documentHtml = documentHtml.toString().replace(/__NAME__/, familyName).replace(/__DATE__/, currentDate);
  
  const Readable = require('stream').Readable
  const documentStream = new Readable
  documentStream.push(documentHtml)    // the string you want
  documentStream.push(null)      // indicates end-of-file basically - the end of the stream
  
  var media = {
    mimeType: 'text/html',
    body: documentStream,
    // fs.createReadStream('/Users/davidvezzani/Dropbox/journal/current/20180805-test.html'), 
  };
    
  drive.files.create({
    fields: 'id', 
    media, 
    resource: {
      ...data, 
      "parents": [
        "18E7UueFZQwMcZprIvmJhfsX-tNNn0hH5" // My Drive > Vineyard-Private > visit-notes
      ], 
      mimeType: 'application/vnd.google-apps.document',
    },
  }, (err, res) => {
    // if (err) return console.log('The API returned an error: ' + err);
    const { status, statusText, data } = res;
    callback(err, { status, statusText, data });
  });
}


