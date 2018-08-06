import socketIo from 'socket.io';
import { sendShellCommand } from './src/actions/shell';

const reportError = (client, err, msg) => {
	client.emit('error', err, msg);
};

const V1_CACHE_DIR = '/Users/davidvezzani/clients/v1-eq/be/data';

const outputPath = (type) => {
  return `#{V1_CACHE_DIR}/v1-eq-${type}-cache.txt`;
}; 

const sendShellCommandWithType = (client, type, data) => {
  console.log(`sendText: ${JSON.stringify(data)}`);
  const label = type.replace(/\w/, c => c.toUpperCase());
  const ioAction = `sendShellCommand:${type}:done`;

  sendShellCommand(data.cmd, outputPath(type), (errRaw, data2) => {
    const { cmd, err, stdout, stderr } = data2;
    let msg = `${label} was activated`
    if (errRaw) msg = `${label} was NOT activated`

    client.emit(ioAction, {err: (err || null), msg, cmd, stdout, stderr});
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
		client.on('sendShellCommand:fetchMembers', function(data) { sendShellCommandWithType(client, 'fetchMembers', data, (res) => {
        client.emit('sendShellCommand:fetchMembers:done', res);
      }); 
    });
	});

};
