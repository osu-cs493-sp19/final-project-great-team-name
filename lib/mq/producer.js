
const amqp = require('amqplib');
const fs = require('fs');


var rabbitmqHost;
var {getDBReference,grid_bucket }= require('../mongoDB');

if(process.env.NODE_ENV === "development"){
  rabbitmqHost = "localhost";
}
else{
  rabbitmqHost = process.env.RABBITMQ_HOST;
}

const FILE_CHANNEL = "UPLOAD";
const TURNIN_BLOBS ="sumbmissions-blobs";
const rabbitmqUrl = `amqp://${rabbitmqHost}`;
var channel = null;
var connection = null;



exports.FILE_CHANNEL = FILE_CHANNEL;


exports.getChannelRef = () =>{
  return channel;
}

exports.getConnRef = () =>{
  return connection;
}


async function main() {
  try {
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(FILE_CHANNEL);
    console.log("Created producer channel");
    } catch (err) {
    console.error(err);
  }
}
main();

exports.gridFSUpload = async function(file,callback){
  // upload the file associated withthe stuff
  var bucket = new grid_bucket(getDBReference(),{ bucketName: TURNIN_BLOBS })

  const metadata = {
    submission_meta_id: file.meta_id,
  };

  var uploadstream = bucket.openUploadStream(
    file.filename,
   { metadata: metadata });


   fs.createReadStream(file.path)
   .pipe(uploadstream)
   .on('error', function (error) {
      console.log("PEIP ERROR");
               console.log(error);
             })
   .on('finish', function () {
               console.log('=== done uploading to grid');
               callback(uploadstream.id);
       });
}

exports.publish_update_job = async function(submission){
  try{
    const objbuffer=Buffer.from(JSON.stringify(submission));
    // connection = await amqp.connect(rabbitmqUrl);
    var c = exports.getChannelRef();
    await c.assertQueue(FILE_CHANNEL);
    c.sendToQueue(FILE_CHANNEL, objbuffer);
    console.log("====\n\n PUBLISHED: ",submission,"\n\n========");
  }
  catch(e){
    console.log(e);
  }
}
