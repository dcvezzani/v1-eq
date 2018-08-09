import socketIo from 'socket.io';
import { sendShellCommand } from './src/actions/shell';
import { fetchMemberSyncReport, importMembers, archiveMembers } from './src/helpers/members';

const reportError = (client, err, msg) => {
	client.emit('error', err, msg);
};

const V1_CACHE_DIR = '/Users/davidvezzani/clients/v1-eq/be/data';

const outputPath = (type) => {
  return `${V1_CACHE_DIR}/v1-eq-${type}-cache.json`;
}; 

const handleAction = (client, ioResponse, data, handler) => {
  handler(data, (err, handlerData) => {
    if (err) return client.emit(ioResponse, {err, ...handlerData});
    client.emit(ioResponse, handlerData);
  });
};

const sendShellCommandWithType = (client, type, data, callback) => {
  console.log(`${type}: ${JSON.stringify(data).slice(0,200)}...`);
  const label = type.replace(/\w/, c => c.toUpperCase());
  const ioAction = `sendShellCommand:${type}:done`;

  sendShellCommand({...data, cachePath: outputPath(type)}, (errRaw, data2) => {
    const { cmd, err, stdout, stderr } = data2;
    let msg = `${label} was activated`
    if (errRaw) msg = `${label} was NOT activated`

    const responsePayload = {err: (err || null), msg, cmd, stdout, stderr};
    if (callback) callback(responsePayload, (err, data) => {
      client.emit(data.ioAction || ioAction, data.responsePayload || responsePayload);
    });
    else client.emit(ioAction, responsePayload);
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

		client.on('db:members:import', function(data) { handleAction(client, 'db:members:import:done', data, importMembers); });
		client.on('db:members:archive', function(data) { handleAction(client, 'db:members:archive:done', data, archiveMembers); });
	});

};
