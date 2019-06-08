
const amqp = require('amqplib');
const FILE_CHANNEL = "UPLOAD";
var rabbitmqHost;

if(process.env.NODE_ENV === "development"){
  rabbitmqHost = "localhost";
}
else{
  rabbitmqHost = process.env.RABBITMQ_HOST;
}

const rabbitmqUrl = `amqp://${rabbitmqHost}`;
var channel = null;
var connection = null;

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

exports.publishUrlWork = async function(submission){
  try{
    const objbuffer=Buffer.from(JSON.stringify(submission));
    connection = await amqp.connect(rabbitmqUrl);
    var c = getChannelRef();
    await c.assertQueue(FILE_CHANNEL);
    c.sendToQueue(FILE_CHANNEL, objbuffer);
    console.log("====\n\n PUBLISHED: ",submission,"\n\n========");
  }
  catch(e){
    console.log(e);
  }
}

exports.FILE_CHANNEL = FILE_CHANNEL;


exports.getChannelRef = () =>{
  return channel;
}

exports.getConnRef = () =>{
  return connection;
}
