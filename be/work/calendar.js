const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
// fs.readFile('../credentials-vineyard1.eq.json', (err, content) => {
fs.readFile('../credentials-dcv.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  // authorize(JSON.parse(content), listEvents);
  // authorize(JSON.parse(content), createEvent);
  authorize(JSON.parse(content), addEvent);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
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
      if (err) return console.error('Error retrieving access token', err);
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
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    // calendarId: 'tp1m4uv0abqgn2u87a6lpa7an4@group.calendar.google.com', // proposed
    calendarId: 't8rpargqt4m674v1afsv0riqug@group.calendar.google.com',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}

function createEvent(auth) {
  const event = {
    'summary': 'Test Appointment - FV',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'EQ Presidency visit',
    'start': {
      'dateTime': '2018-11-27T19:00:00',
      'timeZone': 'America/Denver',
    },
    'end': {
      'dateTime': '2018-11-27T19:30:00',
      'timeZone': 'America/Denver',
    },
  };
    
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.insert({
    calendarId: 'tp1m4uv0abqgn2u87a6lpa7an4@group.calendar.google.com',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', '');
    console.log(event.data.htmlLink);
  });
}

function addEvent(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  const events = [
"Curtis, Jacqueline Anne FV       on 11/27/18 6:00PM for 30 minutes",
"Cheeseman, Patricia Elmina FV    on 11/27/18 6:30PM for 30 minutes",
"Taddei, Tenette FV               on 11/27/18 7:00PM for 30 minutes",

"Loughney, Laryne FV              on 11/28/18 6:00PM for 30 minutes",
"Cassidy, Krysta FV               on 11/28/18 6:30PM for 30 minutes",
"Eliason, Alison FV               on 11/28/18 7:00PM for 30 minutes",

"Barrett, Isabella FV             on 12/2/18 3:00PM for 30 minutes",
"Longani, Ahmalia Loimata FV      on 12/2/18 3:30PM for 30 minutes",
"DeGering, Holly FV               on 12/2/18 4:00PM for 30 minutes",
"Johnson, Heather FV              on 12/2/18 4:30PM for 30 minutes",
"Duke (Spencer), Jan FV           on 12/2/18 5:00PM for 30 minutes",
"Stewart, Connie FV               on 12/2/18 5:30PM for 30 minutes",

"Bean, Paula FV                   on 12/4/18 6:00PM for 30 minutes",
"Gunderson, Kandie FV             on 12/4/18 6:30PM for 30 minutes",
"Frazier, Kelly Jean FV           on 12/4/18 7:00PM for 30 minutes",
"Garza, Flor Lizeth FV            on 12/4/18 7:30PM for 30 minutes",

"Vanisi, Rachel FV                on 12/5/18 6:00PM for 30 minutes",
"Wittmaack, Natalie FV            on 12/5/18 6:30PM for 30 minutes",

"Vanisi, Rachel FV                on 12/6/18 6:00PM for 30 minutes",
"Lamb, Karen FV                   on 12/6/18 6:30PM for 30 minutes",
"Martin, Kris FV                  on 12/6/18 7:00PM for 30 minutes",
"Quackenbush, Alicia FV           on 12/6/18 7:30PM for 30 minutes",

"Dodd, Teresa Colleen Whipple FV  on 12/9/18 3:00PM for 30 minutes",
"Laird, Breann May FV             on 12/9/18 3:30PM for 30 minutes",
"Stewart, LaCrissa FV             on 12/9/18 4:00PM for 30 minutes",
"Viles, Jennifer Asinate FV       on 12/9/18 4:30PM for 30 minutes",
  ]
  
  let offset = 0;
  events.forEach(eventItem => {
    setTimeout(() => {
      calendar.events.quickAdd({
        calendarId: 'tp1m4uv0abqgn2u87a6lpa7an4@group.calendar.google.com',
        text: eventItem,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', '');
        console.log(event.data.htmlLink);
      });
    }, offset);
    offset += 2000;
  })
}

