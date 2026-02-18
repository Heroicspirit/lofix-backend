const http = require('http');

async function addExistingSongs() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({});
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/songs/add-existing',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(' Success:', result);
          console.log(' Songs added to database!');
          console.log(' Now search for "Arijit Singh" in your frontend');
          resolve(result);
        } catch (error) {
          console.error(' Parse Error:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(' Request Error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

addExistingSongs().catch(console.error);
