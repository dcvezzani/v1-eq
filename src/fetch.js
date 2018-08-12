import request from 'request';

export const createNotes = (name, callback) => {
  request.post({uri: 'http://localhost:3000/users/createNotes', json: true, body: {name}}, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    callback(error, {response, body});
  });
};
