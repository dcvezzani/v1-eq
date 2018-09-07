import socketIo from 'socket.io';
import { V1_CACHE_DIR } from './constants';
import { sendShellCommand } from './src/actions/shell';
import { fetchMemberSyncReport, importMembers, archiveMembers, fetchFamilyDetails, fetchFamilies, importFamilies, fetchPhotoFile, ybFetchFamilies } from './src/helpers/members';
import fs from 'fs';

const reportError = (client, err, msg) => {
	client.emit('error', err, msg);
};

const outputPath = (type) => {
  return `${V1_CACHE_DIR}/v1-eq-${type}-cache.json`;
}; 

const handleAction = (client, ioResponse, data, handler) => {
  handler(data, (err, handlerData) => {
    console.log("ioResponse", ioResponse, {err, ...handlerData})
    if (err) return client.emit(ioResponse, {err: err.toString(), ...handlerData});
    client.emit(ioResponse, handlerData);
  });
};

const getLdsCookie = (cmd) => {
  const ldsCmd = new Buffer(cmd, 'base64').toString("ascii");
  console.log("ldsCmd", ldsCmd.split(/-H/).filter(m => m.match(/^...cookie: /)));
  const cookie = ldsCmd.split(/-H/).filter(m => m.match(/^...cookie: /))[0].trim().replace(/^[^c]+cookie: (.*)$/, '$1').replace(/' --compressed.*$/, '').replace(/'$/, '');
  console.log("cookie", cookie)
  return cookie;
};

const logMemberDetails = (member) => {
  const { name, photoUrl } = member;
  return ({ name, photoUrl });
};

const logPhoto = (responsePayload) => {
  const stream = fs.createWriteStream(`${V1_CACHE_DIR}/photos.json`, {flags:'a'});
  const memberDetails = JSON.parse(responsePayload.stdout);

  const members = []
  if (memberDetails.headOfHousehold && memberDetails.headOfHousehold.photoUrl) members.push(logMemberDetails(memberDetails.headOfHousehold))
  // if (memberDetails.spouse && memberDetails.spouse.photoUrl) members.push(logMemberDetails(memberDetails.spouse))
  // if (memberDetails.householdInfo && memberDetails.householdInfo.photoUrl) members.push(logMemberDetails(memberDetails.householdInfo))
  //
  // if (memberDetails.otherHouseholdMembers)
  // memberDetails.otherHouseholdMembers.forEach(other => {
  //   if (other.photoUrl) members.push(logMemberDetails(other))
  // });
  
  stream.write(JSON.stringify(members).replace(/\]/, ',').replace(/\[/, ''));
  stream.end();
}

const sendShellCommandWithType = (client, type, data, callback) => {
  // console.log(`${type}: ${JSON.stringify(data).slice(0,200)}...`);
  const label = type.replace(/\w/, c => c.toUpperCase());
  const ioAction = (data.redirect) ? data.redirect : `sendShellCommand:${type}:done`;
  console.log(`sendShellCommandWithType`, data);

  if (type === 'fetchFamilyDetails') {
    // data.cmd = Buffer.from(createFetchFamilyDetailsCmd("3676616600", getLdsCookie(data.cmd))).toString('base64');
    data.cmd = Buffer.from(createFetchFamilyDetailsCmd(data.memberId, getLdsCookie(data.cmd))).toString('base64');
  }
  if (type === 'fetchPhotoFile') {
    // data.cmd = Buffer.from(createFetchFamilyDetailsCmd("3676616600", getLdsCookie(data.cmd))).toString('base64');

    if (data.photoUrl && data.photoUrl.length > 0)
      data.cmd = Buffer.from(createFetchLdsFileCmd(data.memberId, data.photoUrl)).toString('base64');
    else
      data.cmd = Buffer.from(createPlaceholderPhotoCmd(data.memberId)).toString('base64');
  }

  sendShellCommand({...data, cachePath: outputPath(type)}, (errRaw, data2) => {
    let msg = `${label} was activated`
    if (errRaw) {
      msg = `${label} was NOT activated`;
      return client.emit(data.ioAction || ioAction, {...data2, msg: errRaw.message});
    }

    const { cmd, err, stdout, stderr } = data2;
    const responsePayload = {err: (err || null), msg, cmd, stdout, stderr};

    if (callback) return callback({...data, ...responsePayload}, (err, data) => {
      if (type === 'fetchFamilyDetails') logPhoto(responsePayload);
      return client.emit(data.ioAction || ioAction, data.responsePayload || responsePayload);
    });

    if (type === 'fetchFamilyDetails') logPhoto(responsePayload);
    client.emit(ioAction, responsePayload);
  });
}

export const io = (server) => {
	
	const io = socketIo(server, { path: '/io-eq-v1'});

	io.on('connection', function(client) {  
		console.log('Client connected...');

		client.on('join', function(data) {
			console.log(`join: ${JSON.stringify(data)}`);
			client.emit('joined', 'Greetings program');
		});

		// client.on('sendShellCommand', function(data, type) { sendShellCommandWithType.bind(client, type, data); });
		// client.on('sendText', function(data) { sendShellCommandWithType.bind(client, 'text', data); });
		// client.on('sendEmail', function(data) { sendShellCommandWithType.bind(client, 'email', data); });

		client.on('sendShellCommand', function(data, type) { sendShellCommandWithType(client, type, data); });
		client.on('sendText', function(data) { sendShellCommandWithType(client, 'text', data); });
		client.on('sendEmail', function(data) { sendShellCommandWithType(client, 'email', data); });
		client.on('sendShellCommand:fetchMembers', function(data) { sendShellCommandWithType(client, 'fetchMembers', data, fetchMemberSyncReport); });
		client.on('sendShellCommand:fetchFamilyDetails', function(data) { sendShellCommandWithType(client, 'fetchFamilyDetails', data, fetchFamilyDetails); });
		client.on('sendShellCommand:fetchFamilies', function(data) { sendShellCommandWithType(client, 'fetchFamilies', data, fetchFamilies); });
		client.on('sendShellCommand:fetchPhotoFile', function(data) { sendShellCommandWithType(client, 'fetchPhotoFile', data, fetchPhotoFile); });

		client.on('db:members:import', function(data) { handleAction(client, 'db:members:import:done', data, importMembers); });
		client.on('db:members:archive', function(data) { handleAction(client, 'db:members:archive:done', data, archiveMembers); });
		client.on('db:members:importFamilies', function(data) { handleAction(client, 'db:members:importFamilies:done', data, importFamilies); });
		client.on('db:members:fetchFamilies', function(data) { handleAction(client, 'db:members:fetchFamilies:done', data, ybFetchFamilies); });
	});

};

const createFetchLdsFileCmd = (memberId, fileUrl) => {
return `curl '${fileUrl}' -H 'authority: www.lds.org' -H 'cache-control: max-age=0' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36' -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'referer: https://www.lds.org/directory/?lang=eng' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' > ${V1_CACHE_DIR}/photos-cache/${memberId}`
};

const createPlaceholderPhotoCmd = (memberId) => {
return `cp ${V1_CACHE_DIR}/../person-placeholder.jpg ${V1_CACHE_DIR}/photos-cache/${memberId}`
};

const createFetchFamilyDetailsCmd = (memberId, cookie) => {
return `curl 'https://www.lds.org/directory/services/web/v3.0/mem/householdProfile/${memberId}?imageSize=MEDIUM' -H $'cookie: ${cookie}' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36' -H 'accept: application/json, text/javascript, */*; q=0.01' -H 'referer: https://www.lds.org/directory/?lang=eng' -H 'authority: www.lds.org' -H 'x-requested-with: XMLHttpRequest' --compressed`;
};

// const cookieSample = `audience_split=15; WRUID=1521363450905830; audience_id=501800; aam_uuid=73537519879642355912093815999344016609; lds-preferred-lang-v2=eng; aam_sc=aamsc%3D708195; _CT_RS_=Recording; cr-aths=shown; lds-preferred-lang=eng; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg=1099438348%7CMCIDTS%7C17756%7CMCMID%7C73753970999719347692114950626000914839%7CMCAAMLH-1534375135%7C9%7CMCAAMB-1534643559%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1534045959s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-17759%7CvVersion%7C2.1.0; check=true; s_ppvl=%5B%5BB%5D%5D; s_cc=true; s_ppv=lds.org%253A%2F%2C31%2C31%2C726%2C1095%2C726%2C1440%2C900%2C1%2CL; audience_s_split=38; __CT_Data=gpv=10&ckp=tld&dm=lds.org&apv_59_www11=10&cpv_59_www11=10&rpv_59_www11=10; amlbcookie=76; ctm={\'pgv\':6340694106455654|\'vst\':6628756599683218|\'vstr\':488004792662453|\'intr\':1534041968177|\'v\':1|\'lvst\':53}; TS01b89640=01999b70236afeb672dd247c9b522a1b82c9675ae127b09d76c5992ba483a2350d4f77864aac5eda23453eb9a1656cbb7f849296280986a0d4b0bc790f6774b1ca6aa176e9; lds-id=AQIC5wM2LY4SfcxbpA_ieKAcJ-dyb5ktCNoEqionYhlIzj4.*AAJTSQACMDIAAlNLABMxNzQ4NjQ3ODY0OTI3NDgwMDI0AAJTMQACMDY.*; JSESSIONID=0; __VCAP_ID__=3411eb1e-211e-420b-5072-96ee; mbox=PC#ee4e141ade2147878d6d59092a2da18c.17_36#1597075989|session#8114afdc71f14445932bc15548f06b85#1534043835; utag_main=v_id:0160417984b500311739875dfee004078001d0700093c$_sn:36$_ss:0$_st:1534043783442$vapi_domain:lds.org$dc_visit:35$ses_id:1534041959014%3Bexp-session$_pn:2%3Bexp-session$dc_event:6%3Bexp-session$dc_region:us-east-1%3Bexp-session; ObSSOCookie=Ijlh4Xl5mDu8LP%2Bss3SVCALe8rSeKYMeP4lU%2B4rAD8n5S7jY2xsi%2Fv4ovu1BTZ47t2l2oSU52tfzYB2yXjR4hAgM0oHG3trFsvQc6sBMpkIBwqJandCuh8Kjf1slSJFnmFYAw7gPM1%2Fq3VK8vW%2BXO6pNrHx%2FOViMAIi8yHHLbP%2BVB47uzDCcVajfDKHVnyqaDzVijPUzQceJoURRn4DsWl6FqT9xkY1thEn0SzikeHMT3PpVJ8kHrqpNGOKoMOEqpa8c1Xqd7Q333wfK4AHdJsvKwVLstrqZkJSWyknp4Z5n4IJ2PMsELvEdWbIE15OhSayOpJDNyw3zAB69zcryjwcoQCZt90LRU3NDedofLqA%3D; ADRUM_BTa=R:41|g:bcc54bcd-ed93-4e5f-bb54-0c1921a70e32|n:customer1_acb14d98-cf8b-4f6d-8860-1c1af7831070; ADRUM_BT1=R:41|i:14680|e:228; t_ppv=undefined%2C71%2C60%2C726%2C3379082; s_sq=ldsall%3D%2526pid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252F%25253Flang%25253Deng%2526oid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252Frecords%25252Fmember-profile%25252F3676616600%25253Flang%25253Deng%2526ot%253DA`;
//
// // 3676616600  
// const createFetchDetailsSample = (memberId, cookie) => {
//   return `curl 'https://lcr.lds.org/records/member-profile/service/${memberId}?lang=eng' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36' -H 'accept: application/json, text/plain, |)}>#*' -H 'referer: https://lcr.lds.org/records/member-profile/${memberId}?lang=eng' -H 'authority: lcr.lds.org' -H $'cookie: ${cookie}' --compressed`;
// };
//
// const fetchDetailsSample = `curl 'https://lcr.lds.org/records/member-profile/service/3676616600?lang=eng' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36' -H 'accept: application/json, text/plain, |)}>#*' -H 'referer: https://lcr.lds.org/records/member-profile/3676616600?lang=eng' -H 'authority: lcr.lds.org' -H $'cookie: audience_split=15; WRUID=1521363450905830; audience_id=501800; aam_uuid=73537519879642355912093815999344016609; lds-preferred-lang-v2=eng; aam_sc=aamsc%3D708195; _CT_RS_=Recording; cr-aths=shown; lds-preferred-lang=eng; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg=1099438348%7CMCIDTS%7C17756%7CMCMID%7C73753970999719347692114950626000914839%7CMCAAMLH-1534375135%7C9%7CMCAAMB-1534643559%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1534045959s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-17759%7CvVersion%7C2.1.0; check=true; s_ppvl=%5B%5BB%5D%5D; s_cc=true; s_ppv=lds.org%253A%2F%2C31%2C31%2C726%2C1095%2C726%2C1440%2C900%2C1%2CL; audience_s_split=38; __CT_Data=gpv=10&ckp=tld&dm=lds.org&apv_59_www11=10&cpv_59_www11=10&rpv_59_www11=10; amlbcookie=76; ctm={\'pgv\':6340694106455654|\'vst\':6628756599683218|\'vstr\':488004792662453|\'intr\':1534041968177|\'v\':1|\'lvst\':53}; TS01b89640=01999b70236afeb672dd247c9b522a1b82c9675ae127b09d76c5992ba483a2350d4f77864aac5eda23453eb9a1656cbb7f849296280986a0d4b0bc790f6774b1ca6aa176e9; lds-id=AQIC5wM2LY4SfcxbpA_ieKAcJ-dyb5ktCNoEqionYhlIzj4.*AAJTSQACMDIAAlNLABMxNzQ4NjQ3ODY0OTI3NDgwMDI0AAJTMQACMDY.*; JSESSIONID=0; __VCAP_ID__=3411eb1e-211e-420b-5072-96ee; mbox=PC#ee4e141ade2147878d6d59092a2da18c.17_36#1597075989|session#8114afdc71f14445932bc15548f06b85#1534043835; utag_main=v_id:0160417984b500311739875dfee004078001d0700093c$_sn:36$_ss:0$_st:1534043783442$vapi_domain:lds.org$dc_visit:35$ses_id:1534041959014%3Bexp-session$_pn:2%3Bexp-session$dc_event:6%3Bexp-session$dc_region:us-east-1%3Bexp-session; ObSSOCookie=Ijlh4Xl5mDu8LP%2Bss3SVCALe8rSeKYMeP4lU%2B4rAD8n5S7jY2xsi%2Fv4ovu1BTZ47t2l2oSU52tfzYB2yXjR4hAgM0oHG3trFsvQc6sBMpkIBwqJandCuh8Kjf1slSJFnmFYAw7gPM1%2Fq3VK8vW%2BXO6pNrHx%2FOViMAIi8yHHLbP%2BVB47uzDCcVajfDKHVnyqaDzVijPUzQceJoURRn4DsWl6FqT9xkY1thEn0SzikeHMT3PpVJ8kHrqpNGOKoMOEqpa8c1Xqd7Q333wfK4AHdJsvKwVLstrqZkJSWyknp4Z5n4IJ2PMsELvEdWbIE15OhSayOpJDNyw3zAB69zcryjwcoQCZt90LRU3NDedofLqA%3D; ADRUM_BTa=R:41|g:bcc54bcd-ed93-4e5f-bb54-0c1921a70e32|n:customer1_acb14d98-cf8b-4f6d-8860-1c1af7831070; ADRUM_BT1=R:41|i:14680|e:228; t_ppv=undefined%2C71%2C60%2C726%2C3379082; s_sq=ldsall%3D%2526pid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252F%25253Flang%25253Deng%2526oid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252Frecords%25252Fmember-profile%25252F3676616600%25253Flang%25253Deng%2526ot%253DA' --compressed`
//
