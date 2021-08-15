/*
 *  index.js
 *
 */
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-1'});

exports.handler = async (event) => {
    console.log('Received event: ' + event);
	let responseCode = 500;
	let responseTxt = 'Unknown Error Processing Request';
	
	let queueName = buildQueueName(event);
    
    let queueUrl = null;
    try {
        let obj = await getQueueUrl({QueueName: queueName});
        console.log('Queue named [' + queueName + '] already exists ' +
		      'with URL [' + obj.queueUrl + ']');
    } catch (error) {
        console.log('Error from getQueueUrl (expected if queue does ' +
		      'not exist): ' + error);
    }
          
    if (queueUrl == null) {
        try {
            let queue = await createQueue({QueueName: queueName});
            console.log('Created queue with URL: ' + queue.QueueUrl);
        } catch (error) {
            console.log('Error from createQueue: ' + error);
        }
    }
    
    if (queueUrl == null) {
        //TODO
    }

    var sendParams = {
        DelaySeconds: 0,
        MessageBody: event.body,
        QueueUrl: queueUrl
    };
    
    try {
        let msg = await sendMessage(sendParams);
        responseTxt = 'Sent message with ID [' + msg.MessageId + '] to queue [' + 
		      queueName + ']';
		responseCode = 200;
    } catch (error) {
        console.log(error);
        responseTxt = 'Error sending message to queue: ' + error;
		responseCode = 502;
    }
    console.log(responseTxt);
    
    const response = {
        statusCode: returnCode,
        body: response
    };
    return response;
    
};

function buildQueueName(event) {
  let appName = "UnknownApp";
  let env = "UnknownEnv";
  try {
	  let lastSlash = rawPath.lastIndexOf('/');
	  appName = rawPath.substring(lastSlash, rawPath.length-1);
	  env = rawPath.substring(1, lastSlash-1);
  } catch (error) { }
  
  return appName + '-' + env + '-' + getSource(event) + '-' + getType(event); 
};
module.exports.buildQueueName = buildQueueName;

function getSource(event) {
  try {
	  let source = event.body.source;
	  if (source != null) {
		  return source;
	  }
  } catch (error) { }
  
  try {
	  if (event.headers.indexOf('x-github-event') > -1 ) {
		  return 'github';
	  }
  } catch (error) { }

  return QueueNameVars.UNKNOWN_SOURCE;
};
module.exports.getSource = getSource;

function getType(event) {
	try {
		let type = event.body.type;
		if (type != null) {
			return type;
		}
	} catch (error) { }
	
	try {
		let type = event.headers[('x-github-event')];
		if (type != null) {
			return type;
		}
	} catch (error) { }
	
	return "UnknownType";
};
module.exports.getType = getType;

const createQueue = async params => {
    return await sqs.createQueue(params).promise();
};

const getQueueUrl = async params => {
    return await sqs.getQueueUrl(params).promise();
};

const sendMessage = async params => {
	return await sqs.sendMessage(params).promise();
};

class QueueNameVars {
	static UNKNOWN_SOURCE = 'UnknownSource';
	static UNKNOWN_TYPE = 'UnknownType';
}
