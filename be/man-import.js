/*
node_modules/.bin/babel-node man-import.js
*/
import io from 'socket.io-client';
import fs from 'fs';
import async from 'async';
import btoa from 'btoa';
import readline from 'readline';

const DB_ENABLED = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const socket = io('http://localhost:3000', { path: '/io-eq-v1'});

// let refresh = true
// let fetchCommand
// socket.emit('sendShellCommand:fetchMemberListSummary', {cmd: btoa(fetchCommand), refresh});

// Initialize

let refresh = false
socket.on('joined', (msg) => {
  console.log('socket-in:joined:', msg);
  socket.on('sendShellCommand:fetchMemberListSummary:done', (res) => {

    console.log("sendShellCommand:fetchMemberListSummary:done")

    // console.log("sendShellCommand:fetchMemberListSummary:done", res.members.filter(m => m.id === 6392601365));
    // fs.writeFile("fetchMemberListSummary-res.txt", JSON.stringify(res), (err, res) => {
    //   console.log("Done writing file")
    // })

    // const dummy = { isProfilePrivate: false,
    // unitNo: 13730,
    // householdName: 'xxxxx',
    // spouse:
    //  { latinNameDifferent: false,
    //    latinName: 'xxxxx',
    //    individualId: 9999999998,
    //    preferredName: 'Parry, Leah Beth',
    //    directoryName: 'Leah Beth',
    //    gender: 'FEMALE',
    //    surname: 'Parry' },
    // coupleName: 'xxxxx, yyyy',
    // headOfHouse:
    //  { latinNameDifferent: false,
    //    latinName: 'Parry',
    //    individualId: 9999999999,
    //    preferredName: 'Parry, Tyler Stephen',
    //    directoryName: 'Tyler Stephen',
    //    gender: 'MALE',
    //    surname: 'Parry' },
    // headOfHouseIndividualId: 9999999999,
    // children: [],
    // id: 9999999999 }

    const {removedIds, newRecords, members} = res;

    // members.push(dummy)
    // removedIds.push(9999999999)

    console.log("Done fetching summary", Object.keys(res).map(name => ({name, count: res[name].length})))

    async.series(
      {
        importRecords: (cb) => {
          if (newRecords.length > 0) {
            const recordsSummary = newRecords.map(member => member.coupleName)
            console.log(`Found records to import for ${recordsSummary.join("; ")}`)

            rl.question(`Do you want to import ${newRecords.length} new records at this time? (y/N)`, (answer) => {
              switch (answer) {
                case 'y': 
                  console.log(`Importing ${newRecords.length} records...`)
                  if (DB_ENABLED) socket.emit('db:wardMembers:import', {members: newRecords, offices: []});
                  break;
                default: 
                  console.log("- User canceled action")
              }
              cb()
            });
            
          } else {
            console.log("No new records to import")
            cb()
          }
        }, 

        archiveRecords: (cb) => {
          if (removedIds.length > 0) {
            const recordsSummary = members.filter(member => removedIds.includes(member.id)).map(member => member.coupleName)
            console.log(`Found records to archive for ${recordsSummary.join(", ")}`)

            rl.question(`Do you want to archive ${removedIds.length} records at this time? (y/N)`, (answer) => {
              switch (answer) {
                case 'y': 
                  console.log(`Archiving ${removedIds.length} records...`)
                  if (DB_ENABLED) socket.emit('db:wardMembers:archive', {memberIds: removedIds});
                  break;
                default: 
                  console.log("- User canceled action")
              }
              cb()
            });
            
          } else {
            console.log("No records to archive")
            cb()
          }
        }, 
      }, 
      (err, res) => {
        console.log("Done with import, archive", err, res)
        process.exit();
    });
  })

  socket.on('db:wardMembers:import:done', (res) => {
    console.log("db:wardMembers:import:done", res);
  })
  socket.on('db:wardMembers:archive:done', (res) => {
    console.log("db:wardMembers:archive:done", res);
  })

  socket.emit('sendShellCommand:fetchMemberListSummary', {cmd: btoa(curlCmds.fetch), refresh});
});

socket.emit('join', "Hello, server");

// let cookie = `audience_split=15; WRUID=1521363450905830; audience_id=501800; aam_uuid=73537519879642355912093815999344016609; lds-preferred-lang-v2=eng; optimizelyEndUserId=oeu1540782617013r0.37965657750889314; WRUIDCD=1996711239467180; __CT_Data=gpv=38&ckp=tld&dm=lds.org&apv_59_www11=42&cpv_59_www11=35&rpv_59_www11=33; ctm={\'pgv\':8319653847554533|\'vst\':5404716872998750|\'vstr\':488004792662453|\'intr\':1544365733884|\'v\':1|\'lvst\':3805}; cr-aths=shown; lds-preferred-lang=eng; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg%40AdobeOrg=1999109931%7CMCMID%7C50460743624521144332123202997537125423%7CMCAID%7CNONE; aam_sc=aamsc%3D708195%7C855179; check=true; AMCVS_66C5485451E56AAE0A490D45%40AdobeOrg=1; audience_s_split=77; s_cc=true; _fbp=fb.1.1549203284566.1550766386; ADRUM=s=1549203287897&r=https%3A%2F%2Fwww.lds.org%2F%3F479231918; amlbcookie=75; TS01b89640=01999b7023673b7c4a7a9121eb35868bf49ebf0389979545bc6436f03af44414ea2a53b310c190057f5ff545df584f7e1b91dd296094464f840f8228fc424b48f909b85d47; lds-id=AQIC5wM2LY4SfcwPEHdP7ls69srNxabIozcruAVt35BiCDs.*AAJTSQACMDIAAlNLABMzOTc2MTA1MzE3Njc0MDY1MjE3AAJTMQACMDU.*; JSESSIONID=0; __VCAP_ID__=59cd8b16-f381-4557-58fb-aaad; mbox=PC#ee4e141ade2147878d6d59092a2da18c.28_125#1612448084|session#9c413e96bec946ac93b811d8e961a3db#1549205164; utag_main=v_id:0160417984b500311739875dfee004078001d0700093c$_sn:140$_ss:0$_st:1549205107307$vapi_domain:lds.org$dc_visit:139$ses_id:1549203284012%3Bexp-session$_pn:2%3Bexp-session$dc_event:3%3Bexp-session$dc_region:us-east-1%3Bexp-session; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg=1099438348%7CMCIDTS%7C17924%7CMCMID%7C73753970999719347692114950626000914839%7CMCAAMLH-1549808107%7C9%7CMCAAMB-1549808107%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1549210507s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-17792%7CvVersion%7C2.1.0; ObSSOCookie=fI4upl6b15P%2BOdLzw5yP2XjHjS%2FJrE9kY7uiXURXXIehyJfVxIRFMCXnDZkdkWTepmyoqzsJpHvAaw83h8wPY7eIiCHEqteJwYKE1YmzbaEe%2FQir89CrZOnHVms7JdjR3CcUNjvQjn47hl%2BefCn6pf9OUXJkIycd1Qvqlk3LHRChzqOxghxnPPznDBWgV5xNEAORIL52nbcutYD5%2Fb7g7UPJzCmVVNZiYTccUwNeL6ZdDBOR%2BY7%2BCsjh1TGY%2F46gfbD64XmehrOJ%2Fx93cg3ZwMx9%2BkZxpVTghiar0DXQ7Zy90t7Ppr0EN%2BDKdcJQy6kpvdcjMoKk62CAMq%2F%2BpHom7%2F3fmxA9y2KX9L3PuxriiZs%3D; ADRUM_BTa=R:0|g:28b63ba8-78fe-464d-a171-ea442cd08dbd|n:customer1_acb14d98-cf8b-4f6d-8860-1c1af7831070; ADRUM_BT1=R:0|i:14049|e:269; t_ppv=undefined%2C75%2C55%2C767%2C16852; s_sq=ldsall%3D%2526pid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252F%25253Flang%25253Deng%2526oid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252Forgs%25252F5873015%25253Flang%25253Deng%2526ot%253DA`

const curlCmds = {}
const COOKIE_FILE = '/Users/davidvezzani/projects/v1-eq/be/lds-cookie.txt'

fs.readFile(COOKIE_FILE, (err, cookie) => {
  if (err) return console.error("Unable to read curl command file", e);

  curlCmds.fetch = `curl 'https://lcr.lds.org/services/orgs/sub-orgs-with-callings?lang=eng&subOrgId=5873015' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36' -H 'accept: application/json, text/plain, */*' -H 'referer: https://lcr.lds.org/orgs/5873015?lang=eng' -H 'authority: lcr.lds.org' -H $'cookie: ${cookie}' --compressed`
})

