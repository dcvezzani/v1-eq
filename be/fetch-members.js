import io from 'socket.io-client';
import fs from 'fs';
import btoa from 'btoa';

const CURL_COMMAND_FILE = '/Users/davidvezzani/clients/v1-eq/be/lds-cookie.txt'
const state = {curlCommand: null, 
  ward: {initialFetchDone: false, importDone: false, archiveDone: false, updatedContactInfoDone: false, fetchPhotoFileTarget: 3, fetchPhotoFileCnt: 0, memberInfos: [], }, 
  eq:   {initialFetchDone: false, importDone: false, archiveDone: false, updatedContactInfoDone: false, fetchPhotoFileTarget: 3, fetchPhotoFileCnt: 0, memberInfos: [], }, 
};
const socket = io('http://localhost:3000', { path: '/io-eq-v1'});

const workFlow = () => {
  if (!state.ward.initialFetchDone) {
    state.ward.initialFetchDone = true;
    importMembers()
  }
  else if (!state.ward.archiveDone) archiveMembers()
  else if (!state.ward.updatedContactInfoDone) updateContactInfo(state.ward.members.slice(0,1))
  else console.log("DONE", {fetching: state.ward.members.length, importing: state.ward.newRecords.length, archiving: state.ward.removedIds, updatedContactInfo: true})
};

// Fetch members

const fetchEqMembers = (refresh) => {
  const options = (refresh) ? {cmd: btoa(state.curlCommand), refresh} : {cmd: ''}
  socket.emit('sendShellCommand:fetchMembers', options);
};

const fetchMembers = (refresh) => {
  const options = (refresh) ? {cmd: btoa(state.curlCommand), refresh} : {cmd: ''}
  socket.emit('sendShellCommand:fetchMemberListSummary', options);
};

socket.on('sendShellCommand:fetchMemberListSummary:done', (data) => {
  console.log('sendShellCommand:fetchMemberListSummary:done', {msg: `Successful fetch; ${JSON.stringify(data).slice(0,100)}...`});
  if (data.err) return console.error(data.err);

  state.ward.members = data.members;
  state.ward.newRecords = data.newRecords || [];
  state.ward.removedIds = data.removedIds || [];
  const diffRecordsLength = state.ward.newRecords.length + state.ward.removedIds.length;
  console.log('fetched', {msg: `Successful fetch.  ${(diffRecordsLength === 0) ? 'Local records are already synched.' : 'Updates found.'}`, newRecords: state.ward.newRecords, removedIds: state.ward.removedIds, membersCnt: state.ward.members.length});

  workFlow();
});

// Import members

const importEqMembers = () => {
  socket.emit('db:members:import', {members: state.newRecords});
};

const importMembers = () => {
  if (state.ward.newRecords.length > 0) {
    socket.emit('db:wardMembers:import', {members: state.ward.newRecords});
  } else {
    state.ward.importDone = true;
    fetchMembers(false);
  }
};

socket.on('db:members:import:done', (data) => {
  console.log('db:members:import:done', data);
  
  if (data.err) {
    console.error("EQ member import error", data.err);
  } else {
    console.log("EQ member import", {msg: `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`, });
    state.importDone = true;
    fetchMembers(false);
  }
});

socket.on('db:wardMembers:import:done', (data) => {
  console.log('db:wardMembers:import:done', data);
  
  if (data.err) {
    console.error("Import error", data.err);
  } else {
    console.log("import", {msg: `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`, });
    state.ward.importDone = true;
    fetchMembers(false);
  }
});

// Archive members

const archiveMembers = () => {
  if (state.ward.removedIds.length > 0) {
    socket.emit('db:wardMembers:archive', {memberIds: state.ward.removedIds});
  } else {
    state.ward.archiveDone = true;
    fetchMembers(false);
  }
};

socket.on('db:wardMembers:archive:done', (data) => {
  console.log('db:wardMembers:archive:done', data);

  if (data.err) {
    console.error("Archive error", data.err);
  } else {
    console.log('archive', {msg: `Successful archival; ${JSON.stringify(data.payload).slice(0,100)}...`});
    state.ward.archiveDone = true;
    fetchMembers(false);
  }
});

// Update contact info, fetch images

const updateContactInfo = (selectedMembers) => {
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

socket.on('sendShellCommand:fetchPhotoFile:done', (data) => {
  console.log('sendShellCommand:fetchPhotoFile:done', data);

  state.ward.fetchPhotoFileCnt += 1
  if (state.ward.fetchPhotoFileCnt >= state.ward.fetchPhotoFileTarget) {
    state.ward.updatedContactInfoDone = true;
    workFlow();
  }
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
    fetchMembers(true);
  });
});

socket.emit('join', "Hello, server");



