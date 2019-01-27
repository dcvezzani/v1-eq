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
fs.readFile('credentials.json', (err, content) => {
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
    calendarId: 'tp1m4uv0abqgn2u87a6lpa7an4@group.calendar.google.com', // proposed
    // calendarId: 't8rpargqt4m674v1afsv0riqug@group.calendar.google.com',
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
      'dateTime': '2019-01-27T19:00:00',
      'timeZone': 'America/Denver',
    },
    'end': {
      'dateTime': '2019-01-27T19:30:00',
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
//   const events = [
// "xxxxxx, xxxxxxxxxxxxxxx FV       on 11/27/18 6:00PM for 30 minutes",
// "yyyyyyyyy, yyyyyyyyyyyyyyy FV    on 11/27/18 6:30PM for 30 minutes",
// "zzzzzz, zzzzzzz FV               on 11/27/18 7:00PM for 30 minutes",
//   ]
  
  const events = [
"FV, Smithson on 1/27/19 10:15AM for 10 minutes", 
"FV, Mopine on 1/27/19 10:25AM for 10 minutes", 
"FV, Baldo Dave on 1/27/19 10:35AM for 10 minutes", 
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


/*
{
  "end": {
    "dateTime": "2019-01-27T19:30:00",
    "timeZone": "America/Denver"
  },
  "start": {
    "dateTime": "2019-01-27T19:00:00",
    "timeZone": "America/Denver"
  },
  "attendees": [
    {
      "displayName": "David xxxxxxx",
      "email": "xxxxxxxxx@gmail.com"
    }
  ],
  "description": "Clouds are free. They just float around the sky all day and have fun. You can't have light without dark. You can't know happiness unless you've known sorrow. There it is. This is where you take out all your hostilities and frustrations. It's better than kicking the puppy dog around and all that so.\r\n\r\nJust think about these things in your mind and drop em' on canvas. Let all these things just sort of happen. Just relax and let it flow. That easy. All those little son of a guns. Do an almighty painting with us.\r\n\r\nThe man who does the best job is the one who is happy at his job. Get tough with it, get strong. Only eight colors that you need. Just take out whatever you don't want. It'll change your entire perspective.",
  "summary": "FV, Smithson"
}
 */

