const fs = require('fs');
const readline = require('readline');
const moment = require('moment');
const {google} = require('googleapis');
import { V1_CACHE_DIR } from '../../constants';
import fetch from 'node-fetch'

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
  // authorize(JSON.parse(content), uploadFamilyNotes);
  auth = JSON.parse(content);
});

export const createFamilyNotes = (data, callback) => {
  authorize(auth, data, uploadFamilyNotes, callback);
};

export const uploadDbBackup = (data, callback) => {
  authorize(auth, data, uploadDoc, callback);
};

export const listFamilyNotes = (data, callback) => {
  authorize(auth, data, listFiles, callback);
};

export const findFamilyNotes = (data, callback) => {
  authorize(auth, {query: `name="${data.name}" and trashed=false and parents in "18E7UueFZQwMcZprIvmJhfsX-tNNn0hH5"`}, findFiles, callback);
};

export const fetchDbBackup = (data, callback) => {
  authorize(auth, {id: "1g0udN3Zb05FoW8ZIL3aob2Wy7ZXEVwnI", ...data}, fetchFile, callback);
};

export const updateDbBackup = (data, callback) => {
  authorize(auth, {id: "1g0udN3Zb05FoW8ZIL3aob2Wy7ZXEVwnI", ...data}, updateDoc, callback);
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

function findFiles(auth, data, callback) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
    q: data.query,
  }, (err, res) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return callback(err);
    }
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
    callback(null, files);
  });
}

function fetchFile(auth, data, callback) {
  const drive = google.drive({version: 'v3', auth});
  const destFilename = './dev.sqlite3.sql.enc'
  const dest = fs.createWriteStream(destFilename);

  drive.files.get({
    fileId: data.id,
    alt: 'media', 
  }, {
    responseType: 'stream' // this makes res.data "pipe"-able
  }, (err, res) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return callback(err);
    }

    res.data.on('error', err => {
      console.log('Error while piping to file: ' + err);
      callback(err);
    }).on('end', ()=>{
        callback();
    })
    .pipe(dest);
  });
}

// function copyFile(auth) {
//   const drive = google.drive({version: 'v3', auth});
//   drive.files.copy({
//     fileId: '16hu1ltUZSO6jrnRlp69zxHydQnMUZaPPZ1hQsDkWL3E',
//     resource: {
//       "name": "Vezzani, Dave & Juventa",
//       "parents": [
//         "1i-d35wdCaKKlWB9KmWx72vfXU5vAXZcH"
//       ]
//     },
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     console.log(res);
//   });
// }

function uploadFamilyNotes(auth, data, callback) {
  const drive = google.drive({version: 'v3', auth});

  let documentHtml = fs.readFileSync(`${V1_CACHE_DIR}/../data-default/20180805-test.html`);
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
        // "18E7UueFZQwMcZprIvmJhfsX-tNNn0hH5" // My Drive > Vineyard-Private > visit-notes
        "18E7UueFZQwMcZprIvmJhfsX-tNNn0hH5" // My Drive > Vineyard-Private > visit-notes (v1-eq)
      ], 
      mimeType: 'application/vnd.google-apps.document',
    },
  }, (err, res) => {
    // if (err) return console.log('The API returned an error: ' + err);
    const { status, statusText, data } = res;
    callback(err, { status, statusText, data });
  });
}

function uploadDoc(auth, data, callback) {
  const drive = google.drive({version: 'v3', auth});

  var media = {
    mimeType: 'text/html',
    body: fs.createReadStream(data.filename),
    // '/Users/davidvezzani/Dropbox/journal/current/20180805-test.html'
  };
    
  drive.files.create({
    fields: 'id', 
    media, 
    resource: {
      name: 'dev.sqlite3.sql.enc', 
    },
    
  }, (err, res) => {
    // if (err) return console.log('The API returned an error: ' + err);
    const { status, statusText, data } = res;
    callback(err, { status, statusText, data });
  });
}

function updateDoc(auth, data, callback) {
  const drive = google.drive({version: 'v3', auth});

  const fileMetadata = {
    'name': 'dev.sqlite3.sql.enc'
  };
  const media = {
    mimeType: 'text/html',
    body: fs.createReadStream(data.filename)
  };
  drive.files.update({
    fileId: data.id,
    resource: fileMetadata,
    media: media,
  }, function (err, res) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('res: ', res);
    }
    callback(err, res);
  });
}

/*
function updateDoc2(auth, data, callback) {
  console.log(">>>data", data)
  
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    const access_token = JSON.parse(token)
    // oAuth2Client.setCredentials(JSON.parse(token));
    // callback(oAuth2Client, data, callback2);

    const url = 'https://www.googleapis.com/upload/drive/v3/files/' + data.id + '?uploadType=media';
    const mimeType = 'text/html';
    if(fetch){

      fs.readFile(data.filename, (err, fileContents) => {
        console.log(">>>fileContents", fileContents);
        var setOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': mimeType, 'Authorization': 'Bearer ' + access_token },
            body:  fileContents, //fs.createReadStream(data.filename),
        };
        fetch(url,setOptions)
            .then(response => {
              console.log(">>>response", response);
              if(response.ok){ 
                console.log("save to drive");
                callback();
              } else { 
                console.log("Response wast not ok"); 
                callback(Error("Response wast not ok"));
              }
            })
            .catch(error => {
              console.log("There is an error " + error.message);
              callback(Error("There is an error " + error.message));
            });
      });

    }
    
  });
}
 */

  
// setTimeout(() => {
// // 1g0udN3Zb05FoW8ZIL3aob2Wy7ZXEVwnI
// findFamilyNotes({name: 'Ahlmann, Justin & Shelby Marie'}, (err, res) => {
//   console.log(">>>findFamilyNotes", {err, res})
// })
// }, 2000);

// todo: getting Error 413 (Request Entity Too Large)!!  Need to find an alternate method of updating docs in google docs (non-Google Doc)
// setTimeout(() => {
// // 1g0udN3Zb05FoW8ZIL3aob2Wy7ZXEVwnI
// updateDbBackup({id: '1wK1IPldmrtdI3w-tjnJSLRKPP4QIzyeJ', filename: '/Users/davidvezzani/projects/v1-eq/be/dev.sqlite3.sql.enc'}, (err, res) => {
//   console.log(">>>updateDbBackup", {err, res})
// })
// }, 2000);

// setTimeout(() => {
// // 1g0udN3Zb05FoW8ZIL3aob2Wy7ZXEVwnI
// fetchDbBackup({name: 'dev.sqlite3.sql.enc'}, (err, res) => {
//   console.log(">>>fetchDbBackup", {err, res})
// })
// }, 2000);

// setTimeout(() => {
// // uploadDbBackup({filename: '/Users/davidvezzani/projects/v1-eq/be/dev.sqlite3.sql.enc'}, (err, res) => {
// uploadDbBackup({filename: '/Users/davidvezzani/projects/v1-eq/be/dev.sqlite3.sql.enc'}, (err, res) => {
//   console.log(">>>uploadDbBackup", {err, res})
// })
// }, 2000);

// createFamilyNotes({name: 'xxx'}, (err, res) => {
//   console.log(">>>createFamilyNotes", {err, res})
// })
  
