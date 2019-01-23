import io from 'socket.io-client';
import fs from 'fs';
import btoa from 'btoa';
// import { createNotes } from '../src/fetch';

const CURL_COMMAND_FILE = '/Users/davidvezzani/projects/v1-eq/be/lds-cookie.txt'
const state = {curlCommand: null, 
  ward: {initialFetchDone: false, importDone: false, archiveDone: false, updatedContactInfoDone: false, fetchPhotoFileTarget: 3, fetchPhotoFileCnt: 0, memberInfos: [], }, 
  eq:   {initialFetchDone: false, importDone: false, archiveDone: false, updatedContactInfoDone: false, fetchPhotoFileTarget: 3, fetchPhotoFileCnt: 0, memberInfos: [], memberInfo: null, memberPhotos: [], memberPhoto: null, }, 
};
const socket = io('http://localhost:3000', { path: '/io-eq-v1'});

const wardWorkFlow = () => {
  if (!state.ward.initialFetchDone) {
    state.ward.initialFetchDone = true;
    importWardMembers()
  }
  else if (!state.ward.archiveDone) archiveWardMembers()
  // else if (!state.ward.updatedContactInfoDone) updateWardContactInfo(state.ward.members.slice(0,1))
  else if (!state.ward.updatedContactInfoDone) state.ward.newRecords.forEach(member => updateWardContactInfo(member))
  else console.log("DONE", {fetching: state.ward.members.length, importing: state.ward.newRecords.length, archiving: state.ward.removedIds, updatedContactInfo: true})
};

const eqWorkFlow = () => {
  if (!state.eq.initialFetchDone) {
    state.eq.initialFetchDone = true;
    importEqMembers()
  }
  else if (!state.eq.archiveDone) archiveEqMembers()
  else if (!state.eq.updatedContactInfoDone) state.eq.newRecords.forEach(member => fetchFamilyDetailsBatch(member))
  // else if (!state.eq.updatedContactInfoDone) fetchFamilyDetailsBatch(state.eq.members.slice(0,1))
  else console.log("DONE", {fetching: state.eq.members.length, importing: state.eq.newRecords.length, archiving: state.eq.removedIds, updatedContactInfo: true})
};

// Fetch members

const fetchEqMembers = (refresh) => {
  const options = (refresh) ? {cmd: btoa(state.curlCommand), refresh} : {cmd: ''}
  socket.emit('sendShellCommand:fetchMembers', options);
};

const fetchWardMembers = (refresh) => {
  const options = (refresh) ? {cmd: btoa(state.curlCommand), refresh} : {cmd: ''}
  socket.emit('sendShellCommand:fetchMemberListSummary', options);
};

socket.on('sendShellCommand:fetchMembers:done', (data) => {
  if (data.err) return console.error(data.err);
  const parsedData = JSON.parse(data.stdout)[0];
  state.eq.members = parsedData.members;
  state.eq.newRecords = data.newRecords || [];
  state.eq.removedIds = data.removedIds || [];
  const diffRecordsLength = state.eq.newRecords.length + state.eq.removedIds.length;
  console.log('fetched', {msg: `Successful fetch.  ${(diffRecordsLength === 0) ? 'Local records are already synched.' : 'Updates found.'}`, newRecords: state.eq.newRecords, removedIds: state.eq.removedIds, membersCnt: state.eq.members.length});
  
  eqWorkFlow();
});

socket.on('sendShellCommand:fetchMemberListSummary:done', (data) => {
  console.log('sendShellCommand:fetchMemberListSummary:done', {msg: `Successful fetch; ${JSON.stringify(data).slice(0,100)}...`});
  if (data.err) return console.error(data.err);

  state.ward.members = data.members;
  state.ward.newRecords = data.newRecords || [];
  state.ward.removedIds = data.removedIds || [];
  const diffRecordsLength = state.ward.newRecords.length + state.ward.removedIds.length;
  console.log('fetched', {msg: `Successful fetch.  ${(diffRecordsLength === 0) ? 'Local records are already synched.' : 'Updates found.'}`, newRecords: state.ward.newRecords, removedIds: state.ward.removedIds, membersCnt: state.ward.members.length});

  wardWorkFlow();
});

// Import members

const importEqMembers = () => {
  importMembers(state.eq, 'db:members:import', fetchEqMembers)
};

const importWardMembers = () => {
  importMembers(state.ward, 'db:wardMembers:import', fetchWardMembers)
};

const importMembers = (store, ioPath, fetch) => {
  console.log(">>>state", state);
  if (store.newRecords.length > 0) {
    socket.emit(ioPath, {members: store.newRecords});
  } else {
    store.importDone = true;
    fetch(false);
  }
};

socket.on('db:members:import:done', (data) => {
  console.log('db:members:import:done', data);
  importDone('eq', data, fetchEqMembers);
});

socket.on('db:wardMembers:import:done', (data) => {
  console.log('db:wardMembers:import:done', data);
  importDone('ward', data, fetchWardMembers);
});

const importDone = (type, data, fetch) => {
  const store = state[type]
  if (data.err) {
    console.error(`Import ${type} error`, data.err);
  } else {
    console.log(`import ${type}`, {msg: `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`, });
    store.importDone = true;
    fetch(false);
  }
};


// Archive members

const archiveEqMembers = () => {
  archiveMembers(state.eq, 'db:members:archive', fetchEqMembers)
};

const archiveWardMembers = () => {
  archiveMembers(state.ward, 'db:wardMembers:archive', fetchWardMembers)
};

const archiveMembers = (store, ioPath, fetch) => {
  if (store.newRecords.length > 0) {
    socket.emit(ioPath, {memberIds: store.removedIds});
  } else {
    store.archiveDone = true;
    fetch(false);
  }
};

socket.on('db:members:archive:done', (data) => {
  console.log('db:members:archive:done', data);
  archiveDone('eq', data, fetchEqMembers);
});

socket.on('db:wardMembers:archive:done', (data) => {
  console.log('db:wardMembers:archive:done', data);
  archiveDone('ward', data, fetchWardMembers);
});

const archiveDone = (type, data, fetch) => {
  const store = state[type]
  if (data.err) {
    console.error(`Archive ${type} error`, data.err);
  } else {
    console.log(`archive ${type}`, {msg: `Successful archival; ${JSON.stringify(data.payload).slice(0,100)}...`, });
    store.archiveDone = true;
    fetch(false);
  }
};


// Update contact info, fetch images

const fetchFamilyDetailsBatch = (selectedMembers, refresh = true) => {
  const increment = 3000
  let offset = 0
  selectedMembers.forEach(member => {
    offset += increment;
    setTimeout(() => {
      console.log(`fetching details for member: ${member.id}, ${member.name}`)
      socket.emit('sendShellCommand:fetchFamilyDetails', {cmd: btoa(state.curlCommand), memberId: member.id, refresh: (refresh === true)});
      // socket.emit('sendShellCommand:fetchFamilyDetails', {cmd: btoa(this.fetchCommand), memberId: member.id, refresh: true, redirects: ['sendShellCommand:fetchFamilyDetails:createNotes:done', 'sendShellCommand:fetchFamilyDetails:done']});
      
    }, offset);
  });
};

// socket.on('sendShellCommand:fetchFamilyDetails:createNotes:done', (data) => {
//   const familyDetails = JSON.parse(data.json);
//   console.log("sendShellCommand:fetchFamilyDetails:createNotes:done", familyDetails);
//
//   console.log(`#createNotes for ${familyDetails.coupleName}`);
//   // createNotes(familyDetails.coupleName, (err, res) => {
//   //   console.log("createNotes", err, res);
//   //   console.log('actions', {msg: `Notes created: <a target="_new" href="https://docs.google.com/document/d/${res.body.apiRes.data.id}/edit">${familyDetails.coupleName}</a>`, });
//   // });
// });

const fetchPhotoFile = (memberId, photoUrl) => {
  console.log(`fetching fetchPhotoFile for memberId: ${memberId}`)
  socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(state.curlCommand), memberId, photoUrl, refresh: true});
  // , redirects: ['sendShellCommand:eq:fetchPhotoFile:done']
};

const fetchEqPhotoFile = (memberId, photoUrl) => {
  console.log(`fetching fetchPhotoFile for memberId: ${memberId}`)
  socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(state.curlCommand), memberId, photoUrl, refresh: true, redirects: ['sendShellCommand:eq:fetchPhotoFile:done']});
  // 
};


// socket.on('sendShellCommand:fetchPhotoFile:done', (data) => {
//   console.log("sendShellCommand:fetchPhotoFile:done", data);
// });

socket.on('sendShellCommand:fetchFamilyDetails:done', (data) => {
  console.log("sendShellCommand:fetchFamilyDetails:done", data);
  const memberDetails = JSON.parse(data.json);
  state.eq.memberInfo = memberDetails;

  {
    setTimeout(() => {fetchEqPhotoFile(data.memberId, memberDetails.headOfHousehold.photoUrl);}, 3000);
  }

  const familyId = `${memberDetails.householdInfo.individualId}-family`;
  {
    setTimeout(() => {fetchEqPhotoFile(familyId, memberDetails.householdInfo.photoUrl);}, 3000);
  }

  // state.eq.memberPhotos.length = 0;
  // if (memberDetails.headOfHousehold) {
  //   const { name, photoUrl } = memberDetails.headOfHousehold;
  //   if (photoUrl) state.eq.memberPhotos.push({ name, photoUrl });
  // }
  // if (memberDetails.spouse) {
  //   const { name, photoUrl } = memberDetails.spouse;
  //   if (photoUrl) state.eq.memberPhotos.push({ name, photoUrl });
  // }
  // if (memberDetails.householdInfo) {
  //   const { name, photoUrl } = memberDetails.householdInfo;
  //   if (photoUrl) state.eq.memberPhotos.push({ name, photoUrl });
  // }
  // memberDetails.otherHouseholdMembers.forEach(other => {
  //   const { name, photoUrl } = other;
  //   if (photoUrl) state.eq.memberPhotos.push({ name, photoUrl });
  // });

  // state.eq.memberPhoto = (memberDetails.headOfHousehold.individualId === data.memberId) ? memberDetails.headOfHousehold.photoUrl : memberDetails.spouse.photoUrl;

  state.eq.updatedContactInfoDone = true;
  eqWorkFlow();
});
  

const updateWardContactInfo = (selectedMembers) => {
  const offsetAmount = 3000;
  let offset = 0;

  const targetedMembers = (selectedMembers.length > 0) ? selectedMembers : state.ward.members;
  // state.ward.members.slice(0,1).forEach(member => {
  targetedMembers.forEach(member => {
    offset += offsetAmount;
    setTimeout(() => {
      socket.emit('sendShellCommand:updateContactInfo', {cmd: btoa(state.curlCommand), memberId: member.id, refresh: true});
    }, offset);
  });
};

socket.on('sendShellCommand:eq:fetchPhotoFile:done', (data) => {
  console.log('sendShellCommand:eq:fetchPhotoFile:done', data);

  // state.ward.fetchPhotoFileCnt += 1
  // if (state.ward.fetchPhotoFileCnt >= state.ward.fetchPhotoFileTarget) {
  //   state.ward.updatedContactInfoDone = true;
  //   wardWorkFlow();
  // }

  state.ward.updatedContactInfoDone = true;
  eqWorkFlow();
});

socket.on('sendShellCommand:fetchPhotoFile:done', (data) => {
  console.log('sendShellCommand:fetchPhotoFile:done', data);

  // state.ward.fetchPhotoFileCnt += 1
  // if (state.ward.fetchPhotoFileCnt >= state.ward.fetchPhotoFileTarget) {
  //   state.ward.updatedContactInfoDone = true;
  //   wardWorkFlow();
  // }

  state.ward.updatedContactInfoDone = true;
  wardWorkFlow();
});

socket.on('sendShellCommand:updateContactInfo:done', (data) => {
  const memberInfo = JSON.parse(data.json);
  console.log(">>>memberInfo", memberInfo);
  console.log('sendShellCommand:updateContactInfo:done', memberInfo);

  const { photoUrl: hohPhotoUrl, individualId: hohId } = memberInfo.headOfHousehold;
  const { photoUrl: spousePhotoUrl, individualId: spouseId } = memberInfo.spouse || {};
  const { photoUrl: familyPhotoUrl } = memberInfo.householdInfo;
  const familyId = `${memberInfo.householdInfo.individualId}-family`;

  // const { imageId: hohImageId, individualId: hohId } = memberInfo.headOfHousehold;
  // const { imageId: spouseImageId, individualId: spouseId } = memberInfo.spouse;
  // const { imageId: familyImageId } = memberInfo.householdInfo;
  // const familyId = `${memberInfo.householdInfo.individualId}-family`;

  {
    setTimeout(() => {
      socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(state.curlCommand), memberId: hohId, photoUrl: hohPhotoUrl, refresh: true, photoCacheDir: 'ward-photos-cache'});
      
    }, 3000);
  }

  {
    setTimeout(() => {
      socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(state.curlCommand), memberId: spouseId, photoUrl: spousePhotoUrl, refresh: true, photoCacheDir: 'ward-photos-cache'});
      
    }, 4000);
  }

  {
    setTimeout(() => {
      socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(state.curlCommand), memberId: familyId, photoUrl: familyPhotoUrl, refresh: true, photoCacheDir: 'ward-photos-cache'});
    }, 5000);
  }

  const { email, phone } = memberInfo.headOfHousehold;
  console.log('actions', {msg: `Fetched member information for ${memberInfo.coupleName}: ${JSON.stringify({ email, phone })}`});

  state.ward.memberInfo = memberInfo;
  state.ward.memberInfos.push(memberInfo);

  // this.memberPhotos.length = 0;
  // if (memberInfo.headOfHousehold) {
  //   const { name, photoUrl } = memberInfo.headOfHousehold;
  //   if (photoUrl) this.memberPhotos.push({ name, photoUrl });
  // }
  // if (memberInfo.spouse) {
  //   const { name, photoUrl } = memberInfo.spouse;
  //   if (photoUrl) this.memberPhotos.push({ name, photoUrl });
  // }
  // if (memberInfo.householdInfo) {
  //   const { name, photoUrl } = memberInfo.householdInfo;
  //   if (photoUrl) this.memberPhotos.push({ name, photoUrl });
  // }
  // memberInfo.otherHouseholdMembers.forEach(other => {
  //   const { name, photoUrl } = other;
  //   if (photoUrl) this.memberPhotos.push({ name, photoUrl });
  // });
  
});


// Initialize

socket.on('joined', (msg) => {
  console.log('socket-in:joined:', msg);

  fs.readFile(CURL_COMMAND_FILE, (err, curlCommand) => {
    if (err) return console.error("Unable to read curl command file", e);

    state.curlCommand = curlCommand
    fetchWardMembers(true);
    fetchEqMembers(true);
  });
});

socket.emit('join', "Hello, server");



