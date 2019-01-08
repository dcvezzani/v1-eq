// BEFORE RUNNING:
// ---------------
// 1. If not already done, enable the Google Sheets API
//    and check the quota for your project at
//    https://console.developers.google.com/apis/api/sheets
// 2. Install the Node.js client library by running
//    `npm install googleapis --save`


import async from 'async'
const {google} = require('googleapis');
const fs = require('fs');
import db from './db';
import WardMember from './src/models/ward_members';
import { createFamilyNotes, findFamilyNotes } from './src/api/drive.js';
const sqlite3 = require('sqlite3').verbose();

// let db2 = new sqlite3.Database('./dev.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
//   if (err) {
//     console.error(err.message);
//   }
//   console.log('Connected to the dev.sqlite3 database.');
// });

const TOKEN_PATH = 'token-sheets.json';
// const DRIVE_TOKEN_PATH = 'token.json';

const SPREAD_SHEET_ID = '16YX_lBxUppMiruNk8-ImzhpHzr8OoElQ6KE-xBT8ZG0';

var sheets = google.sheets('v4');

function create(authClient) {
  var request = {
    resource: {
      // TODO: Add desired properties to the request body.
      //
      "properties": {
        "title": "v1-eq-member-details"
      },
      "sheets": [
        {
          "properties": {
            "sheetId": 1000,
            "tabColor": {
              "blue": 1
            },
            "sheetType": "GRID",
            "title": "Apple",
            "gridProperties": {
              "columnCount": 10,
              "frozenRowCount": 1
            }
          }
        },
        {
          "properties": {
            "sheetId": 1001,
            "tabColor": {
              "green": 1
            },
            "title": "Orange"
          }
        }
      ]
      
    },

    auth: authClient,
  };

  sheets.spreadsheets.create(request, function(err, response) {
    if (err) {
      console.error(err);
      return;
    }

    // TODO: Change code below to process the `response` object:
    // console.log(JSON.stringify(response, null, 2));
    console.log("sheets.spreadsheets.create", {err, response})
  });
}

const headerRow = () => {
  return ["coupleName", "address", "phone", "email", "notes_url"].map(header => {
    return JSON.parse(`{ "userEnteredValue": { "stringValue": "${header}" } }`)
  })
}

const fetchDataRows = (callback) => {

  const dataRows = {};
  async.series({
    eastlake: (cb) => {
      const tagName = 'eastlake';
      WardMember.allNotArchivedWithTag(tagName, (err, rows) => {
        if (err) callback("Unable to fetch ward members", {err});
        dataRows[tagName] = rows.map(row => ({"values": dataRow(row) }))
        cb(err, {name: tagName, cnt: rows.length});
      })
    }, 
    meadows: (cb) => {
      const tagName = 'meadows';
      WardMember.allNotArchivedWithTag(tagName, (err, rows) => {
        if (err) callback("Unable to fetch ward members", {err});
        dataRows[tagName] = rows.map(row => ({"values": dataRow(row) }))
        cb(err, {name: tagName, cnt: rows.length});
      })
    }, 
    alloy: (cb) => {
      const tagName = 'alloy';
      WardMember.allNotArchivedWithTag(tagName, (err, rows) => {
        if (err) callback("Unable to fetch ward members", {err});
        dataRows[tagName] = rows.map(row => ({"values": dataRow(row) }))
        cb(err, {name: tagName, cnt: rows.length});
      })
    }, 
    holdaway: (cb) => {
      const tagName = 'holdaway';
      WardMember.allNotArchivedWithTag(tagName, (err, rows) => {
        if (err) callback("Unable to fetch ward members", {err});
        dataRows[tagName] = rows.map(row => ({"values": dataRow(row) }))
        cb(err, {name: tagName, cnt: rows.length});
      })
    }, 
    cottonwoods: (cb) => {
      const tagName = 'cottonwoods';
      WardMember.allNotArchivedWithTag(tagName, (err, rows) => {
        if (err) callback("Unable to fetch ward members", {err});
        dataRows[tagName] = rows.map(row => ({"values": dataRow(row) }))
        cb(err, {name: tagName, cnt: rows.length});
      })
    }, 
    other: (cb) => {
      const tagName = 'other-neighborhoods';
      WardMember.allNotArchivedWithTag(tagName, (err, rows) => {
        if (err) callback("Unable to fetch ward members", {err});
        dataRows['other'] = rows.map(row => ({"values": dataRow(row) }))
        cb(err, {name: tagName, cnt: rows.length});
      })
    }, 

  }, 
  (err, res) => {
    console.log("DONE feetching data rows", err, res);
    callback(err, dataRows);
  });
}

const dataRow = (row) => {
  // console.log(">>>row", row);
  const {coupleName, address, phone, email, notes_url} = row;
  return [coupleName, address || "", phone || "", email || "", notes_url || ""].map(value => {
    return JSON.parse(`{ "userEnteredValue": { "stringValue": "${value}" } }`)
  })
}

/*
Sync up notes; create missing ones; update notes_url link

const saveNotesUrl = (id, notes_url) => {
  let data = [notes_url, id];
  let sql = `update ward_members set notes_url = ? where id = ?`;
   
  db2.run(sql, data, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);
   
  });
  
};

let sql = `select * from ward_members where archived_at is null and notes_url is null`;
 
let offset = 0
let offsetInc = 3
const messages = []
db2.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.coupleName);

    setTimeout(() => {
    findFamilyNotes({name: row.coupleName}, (err, res) => {
      if (res.length > 1) {
        console.log(">>> DUPLICATES FOUND!", res);
        messages.push({duplicates: res});
      }
      else if (res.length > 0) {
        console.log(`findFamilyNotes ${row.coupleName}:`, err, res[0].id);
        const notes_url = `https://docs.google.com/document/d/${res[0].id}`
        saveNotesUrl(row.id, notes_url)
      }
      else {
        const {coupleName, notes_url, id} = row
        console.log(">>> MISSING NOTES!", {coupleName, notes_url, id});
        messages.push({missing: res});

        createFamilyNotes({name: row.coupleName}, (err, res) => {
          console.log(">>>created notes", res.data.id);
          const notes_url = `https://docs.google.com/document/d/${res.data.id}`
          saveNotesUrl(row.id, notes_url)
        });
      }
    })
    }, offset * 1000);
    offset += offsetInc;
        
  });
  console.log("DONE", messages);
});
 */

function update(authClient, dataRows, callback) {
  console.log(">>>headerRow()", JSON.stringify(headerRow()));
  var request = {
    spreadsheetId: SPREAD_SHEET_ID, 
    resource: {
      "requests": [
        {
          "deleteSheet": {
            "sheetId": 1000, 
          }
        }, 
        {
          "deleteSheet": {
            "sheetId": 1001, 
          }
        }, 
        {
          "deleteSheet": {
            "sheetId": 1002, 
          }
        }, 

        // {
        //   "addSheet": {
        //     "properties": {
        //       "tabColor": {
        //         "blue": 0
        //       },
        //       "sheetId": 1000, 
        //       "title": "Eastlake",
        //       "gridProperties": {
        //         "columnCount": 10,
        //         "frozenRowCount": 1
        //       }, 
        //     },
        //   }
        // }, 
        {
          "addSheet": {
            "properties": {
              "tabColor": {
                "blue": 0
              },
              "sheetId": 1000, 
              "title": "Meadows",
              "gridProperties": {
                "columnCount": 10,
                "frozenRowCount": 1
              }, 
            },
          }
        }, 
        {
          "deleteSheet": {
            "sheetId": 1003, 
          }
        }, 
        {
          "addSheet": {
            "properties": {
              "tabColor": {
                "blue": 0
              },
              "sheetId": 1001, 
              "title": "Alloy",
              "gridProperties": {
                "columnCount": 10,
                "frozenRowCount": 1
              }, 
            },
          }
        }, 
        // {
        //   "addSheet": {
        //     "properties": {
        //       "tabColor": {
        //         "blue": 0
        //       },
        //       "sheetId": 1003, 
        //       "title": "Holdaway",
        //       "gridProperties": {
        //         "columnCount": 10,
        //         "frozenRowCount": 1
        //       }, 
        //     },
        //   }
        // }, 
        {
          "addSheet": {
            "properties": {
              "tabColor": {
                "blue": 0
              },
              "sheetId": 1002, 
              "title": "Other",
              "gridProperties": {
                "columnCount": 10,
                "frozenRowCount": 1
              }, 
            },
          }
        }, 
        {
          "addSheet": {
            "properties": {
              "tabColor": {
                "blue": 0
              },
              "sheetId": 1003, 
              "title": "Cottonwoods",
              "gridProperties": {
                "columnCount": 10,
                "frozenRowCount": 1
              }, 
            },
          }
        }, 
        // {
        //   "updateCells": {
        //     "rows": [
        //       {"values": headerRow() }, 
        //       dataRows.eastlake,
        //     ], 
        //     "fields": "userEnteredValue", 
        //     "start": {
        //       "sheetId": 1000, 
        //       "rowIndex": 0, 
        //       "columnIndex": 0, 
        //     }
        //   }
        // }, 
        {
          "updateCells": {
            "rows": [
              {"values": headerRow() }, 
              dataRows.alloy,
            ], 
            "fields": "userEnteredValue", 
            "start": {
              "sheetId": 1001, 
              "rowIndex": 0, 
              "columnIndex": 0, 
            }
          }
        }, 
        {
          "updateCells": {
            "rows": [
              {"values": headerRow() }, 
              dataRows.cottonwoods,
            ], 
            "fields": "userEnteredValue", 
            "start": {
              "sheetId": 1003, 
              "rowIndex": 0, 
              "columnIndex": 0, 
            }
          }
        }, 
        // {
        //   "updateCells": {
        //     "rows": [
        //       {"values": headerRow() }, 
        //       dataRows.holdaway,
        //     ], 
        //     "fields": "userEnteredValue", 
        //     "start": {
        //       "sheetId": 1003, 
        //       "rowIndex": 0, 
        //       "columnIndex": 0, 
        //     }
        //   }
        // }, 
        {
          "updateCells": {
            "rows": [
              {"values": headerRow() }, 
              dataRows.meadows,
            ], 
            "fields": "userEnteredValue", 
            "start": {
              "sheetId": 1000, 
              "rowIndex": 0, 
              "columnIndex": 0, 
            }
          }
        }, 
        {
          "updateCells": {
            "rows": [
              {"values": headerRow() }, 
              dataRows.other,
            ], 
            "fields": "userEnteredValue", 
            "start": {
              "sheetId": 1002, 
              "rowIndex": 0, 
              "columnIndex": 0, 
            }
          }
        }, 
        {
          "updateSheetProperties": {
            "properties": {
              "sheetId": 1001, 
              "index": 1,
            },
            "fields": "sheetId,index"
          }
        }, 
        {
          "updateSheetProperties": {
            "properties": {
              "sheetId": 1003, 
              "index": 2,
            },
            "fields": "sheetId,index"
          }
        }, 
        {
          "updateSheetProperties": {
            "properties": {
              "sheetId": 1000, 
              "index": 3,
            },
            "fields": "sheetId,index"
          }
        }, 
        {
          "updateSheetProperties": {
            "properties": {
              "sheetId": 1002, 
              "index": 4,
            },
            "fields": "sheetId,index"
          }
        }, 
      ]
    },

    auth: authClient,
  }  

  sheets.spreadsheets.batchUpdate(request, function(err, response) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    // TODO: Change code below to process the `response` object:
    // console.log(JSON.stringify(response, null, 2));
    console.log("sheets.spreadsheets.create", {err, response})
    callback(null, response);
  });
  
}

authorize(function(authClient) {
  // create(authClient);

  fetchDataRows((err, dataRows) => {
    // console.log("dataRows", JSON.stringify(dataRows));
    // console.log("dataRows", Object.keys(dataRows));
    update(authClient, dataRows, (err, res) => {
      console.log("DONE");
    });
  });
});

// WardMember.allEastlake((err, rows) => {
//   console.log("DONE", err, rows.length)
// })

// authorizeDocs(function(authClient) {
//   // console.log("authClient", authClient);:
//   findFiles(authClient, {query: `name="Ahlmann, Justin & Shelby Marie" and trashed=false`}, (err, res) => {
//     console.log("Found notes: ", JSON.stringify(res));
//   })
// })

function asClient(credentials, token_path, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(token_path, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(null, oAuth2Client);
  });
}

function authorize(callback) {
  // TODO: Change placeholder below to generate authentication credentials. See
  // https://developers.google.com/sheets/quickstart/nodejs#step_3_set_up_the_sample
  //
  // Authorize using one of the following scopes:
  //   'https://www.googleapis.com/auth/drive'
  //   'https://www.googleapis.com/auth/drive.file'
  //   'https://www.googleapis.com/auth/spreadsheets'

  // Load client secrets from a local file.
  fs.readFile('credentials-sheets.json', (err, credentials) => {
    if (err) return console.log('Error loading client secret file:', err);

    // Authorize a client with credentials, then call the Google Sheets API.
    asClient(JSON.parse(credentials), TOKEN_PATH, (err, authClient) => {
      if (authClient == null) {
        console.log('authentication failed');
        return;
      }
      callback(authClient);
    });
  });
}

// function authorizeDocs(callback) {
//   // TODO: Change placeholder below to generate authentication credentials. See
//   // https://developers.google.com/sheets/quickstart/nodejs#step_3_set_up_the_sample
//   //
//   // Authorize using one of the following scopes:
//   //   'https://www.googleapis.com/auth/drive'
//   //   'https://www.googleapis.com/auth/drive.file'
//   //   'https://www.googleapis.com/auth/spreadsheets'
//
//   // Load client secrets from a local file.
//   fs.readFile('credentials.json', (err, credentials) => {
//     if (err) return console.log('Error loading client secret file:', err);
//
//     // Authorize a client with credentials, then call the Google Sheets API.
//     asClient(JSON.parse(credentials), DRIVE_TOKEN_PATH, (err, authClient) => {
//       if (authClient == null) {
//         console.log('authentication failed');
//         return;
//       }
//       callback(authClient);
//     });
//   });
// }


/*
select * from ward_members where id in (select id from ward_members where upper(address) like '%180 S%' or upper(address) like '%140 S%' or upper(address) like '%1990 W%' or upper(address) like '%1850 W%')

select * from ward_members where id in (select id from ward_members where upper(address) like '%Sterling%' or upper(address) like '%Silver Oak%' or upper(address) like '%Dry Creek%' or upper(address) like '%Quivira%')

select * from ward_members where id in (select id from ward_members where upper(address) like '%100 S Geneva%')

select * from ward_members where id in (select id from ward_members where upper(address) like '%Holdaway%')

select * from ward_members where id not in (select id from ward_members where upper(address) like '%Holdaway%')
and id not in (select id from ward_members where upper(address) like '%100 S Geneva%')
and id not in (select id from ward_members where upper(address) like '%Sterling%' or upper(address) like '%Silver Oak%' or upper(address) like '%Dry Creek%' or upper(address) like '%Quivira%')
and id not in (select id from ward_members where upper(address) like '%180 S%' or upper(address) like '%140 S%' or upper(address) like '%1990 W%' or upper(address) like '%1850 W%');

WardMember db helper

	allEastlake: (callback) => {
    let query = db.schema.raw("select * from ward_members where id in (select id from ward_members where upper(address) like '%180 S%' or upper(address) like '%140 S%' or upper(address) like '%1990 W%' or upper(address) like '%1850 W%') order by coupleName asc");
		// let query = db('ward_members').select().whereNull('archived_at').whereNotNull('notes_url');
		console.log("query.toString()", query.toString());

		// query.orderBy('coupleName', 'asc')
		query
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},

*/
