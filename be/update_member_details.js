import async from 'async'
const {google} = require('googleapis');
const fs = require('fs');
import db from './db';
import WardMember from './src/models/ward_members';
import { createFamilyNotes, findFamilyNotes } from './src/api/drive.js';
const sqlite3 = require('sqlite3').verbose();

// NOTE: if unauthorized, it will probably be likely that test4.js be run to update token-sheets.json
const TOKEN_PATH = 'token-sheets.json';
const SPREAD_SHEET_ID = '16YX_lBxUppMiruNk8-ImzhpHzr8OoElQ6KE-xBT8ZG0';
const sheets = google.sheets('v4');

const headerRow = () => {
  return ["coupleName", "address", "phone", "email", "notes_url"].map(header => {
    return JSON.parse(`{ "userEnteredValue": { "stringValue": "${header}" } }`)
  })
}

const areas = ['hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods']

const dataRow = (row) => {
  const {coupleName, address, phone, email, notes_url} = row;
  return [coupleName, address || "", phone || "", email || "", notes_url || ""].map(value => {
    return JSON.parse(`{ "userEnteredValue": { "stringValue": "${value}" } }`)
  })
}

const fetchDataRows = (callback) => {
  const dataRows = {};
  const series = areas.reduce((coll, area) => {
    const func = (cb) => {
      const tagName = area;
      WardMember.allNotArchivedWithTag(tagName, (err, rows) => {
        if (err) callback("Unable to fetch ward members", {err});
        dataRows[tagName] = rows.map(row => ({"values": dataRow(row) }))
        cb(err, {name: tagName, cnt: rows.length});
      })
    }
    coll[area] = func
    return coll
  }, {})

  async.series(
    { ...series, }, 
    (err, res) => {
      console.log("DONE feetching data rows", err, res);
      callback(err, dataRows);
    }
  );
};

function update(authClient, dataRows, callback) {
  // console.log(">>>headerRow()", JSON.stringify(headerRow()));
  
  // const deleteSheetsOld = [...Array(4).keys()].map(idx => idx + 1000).map(idx => ( { "deleteSheet": { "sheetId": idx, } } ))
  const deleteSheets = [...Array(areas.length - 1).keys()].map(idx => idx + 1010).map(idx => ( { "deleteSheet": { "sheetId": idx, } } ))
  const deleteLastSheet = [{ "deleteSheet": { "sheetId": (1010 + areas.length-1), } }]
  const addFirstSheet = [{ "addSheet": { "properties": { "tabColor": { "blue": 0 }, "sheetId": 1010, "title": areas[0], "gridProperties": { "columnCount": 10, "frozenRowCount": 1 }, }, } }]
  const addSheets = areas.slice(1, areas.length).map((area, idx) => ({ "addSheet": { "properties": { "tabColor": { "blue": 0 }, "sheetId": (1011 + idx), "title": area, "gridProperties": { "columnCount": 10, "frozenRowCount": 1 }, }, } }))
  const updateCells = areas.map((area, idx) => ( { "updateCells": { "rows": [ {"values": headerRow() }, dataRows[area], ], "fields": "userEnteredValue", "start": { "sheetId": (1010 + idx), "rowIndex": 0, "columnIndex": 0, } } } ))
  const updateSheetProperties = areas.map((area, idx) => ( { "updateSheetProperties": { "properties": { "sheetId": (1010 + idx), "index": idx + 1, }, "fields": "sheetId,index" } } ))
  
  const request = {
    spreadsheetId: SPREAD_SHEET_ID, 
    resource: {
      "requests": [
        ...deleteSheets, 
        ...addFirstSheet, 
        ...deleteLastSheet, 
        ...addSheets, 
        ...updateCells, 
        // ...updateSheetProperties, 
      ]
    },

    auth: authClient,
  }  

  sheets.spreadsheets.batchUpdate(request, function(err, response) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    console.log("sheets.spreadsheets.create", {err, response})
    callback(null, response);
  });
};

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

authorize(function(authClient) {
  fetchDataRows((err, dataRows) => {
    update(authClient, dataRows, (err, res) => {
      console.log("DONE");
    });
  });
});

