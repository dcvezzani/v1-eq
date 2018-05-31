import socketIo from 'socket.io';

const reportError = (client, err, msg) => {
	client.emit('error', err, msg);
};

export const io = (server) => {
	
	const io = socketIo(server, { path: '/io-eq-v1'});

	io.on('connection', function(client) {  
		console.log('Client connected...');

		client.on('join', function(data) {
			console.log(`join: ${JSON.stringify(data)}`);
			client.emit('joined', 'Greetings program');
		});
	});

};
