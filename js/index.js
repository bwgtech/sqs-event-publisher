/**
 *  index.js
 *
 *  Lambda handler
 *
 *    Routes incoming json to SQS based on headers and message elements.
 *
 */
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-1'});

exports.handler = async (event) => {
    console.log('Received event: ' + event);
	
	// Some initial default values in case things go awry
	let responseCode = 500;
	let responseTxt = 'Unknown Error Processing Request';
	
	let queueName = buildQueueName(event);
    
	// Check if a queue with the desired name already exists
	let queueUrl = null;
    try {
        let existingQ = await getQueueUrl({QueueName: queueName});
		queueUrl = existingQ.QueueUrl;
        console.log('Queue named [' + queueName + '] already exists ' +
		      'with URL [' + queueUrl + ']');
    } catch (error) {
        console.log('Error from getQueueUrl (expected if queue does ' +
		      'not exist): ' + error);
    }
    
	// If queue does not already exist, create it
    if (queueUrl == null) {
        try {
            let newQ = await createQueue({QueueName: queueName});
			queueUrl = newQ.QueueUrl;
            console.log('Created queue with URL: ' + queueUrl);
        } catch (error) {
            console.log('Error from createQueue: ' + error);
        }
    }
    
	// If we have a valid queue and message body, attempt to send it to queue
    try {
		let body = event.body;
		if (queueUrl.length > 0 && body.length > 0) {
			let sendParams = {
			      DelaySeconds: 0,
			      MessageBody: body,
			      QueueUrl: queueUrl
			};
			let msg = await sendMessage(sendParams);
			responseTxt = 'Sent message with ID [' + msg.MessageId + 
			      '] to queue [' + queueName + ']';
			responseCode = 200;
		} else {
			
		}
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

/** @class QueueNameVars containing constant strings for use in queue names. */
class QueueNameVars {
	static UNKNOWN_APP = 'UnknownApp';
	static UNKNOWN_ENV = 'UnknownEnv';
	static UNKNOWN_SOURCE = 'UnknownSource';
	static UNKNOWN_TYPE = 'UnknownType';
}
module.exports.QueueNameVars = QueueNameVars;

/**
 * Constructs a queue name string in the format:
 *   <Application Name> - <Environment> - <Source> - <Message/Operation Type>
 *
 *   @param {object} event The Lambda event object
 *   @return {string} The constructed queue name (@see QueueNameVars for values 
 *     that this can contain if certain tokens were undeterminable.
 */
function buildQueueName(event) {
  let appName = QueueNameVars.UNKNOWN_APP;
  let env = QueueNameVars.UNKNOWN_ENV;
  try {
	  let path = event.rawPath;
	  let lastSlash = path.lastIndexOf('/');
	  appName = path.substring(lastSlash + 1, path.length);
	  env = path.substring(1, lastSlash);
  } catch (error) { }
  
  return appName + '-' + env + '-' + getSource(event) + '-' + getType(event);
};
module.exports.buildQueueName = buildQueueName;

/**
 * Determines the source of the event based on HTTP headers and/or message 
 * contents.
 *
 *   @param {Event} event The Lambda event object
 *   @return {string} The source string (or "UnknownSource" if no source could be determined.
 */
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

/**
 * Determines the type of the event/operation based on HTTP headers and/or message contents.
 *
 * @param {Event} event The Lambda event object
 * @return {string} The type string (or "UnknownType" if no type could be determined.
 */
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
	
	return QueueNameVars.UNKNOWN_TYPE;
};
module.exports.getType = getType;

// Below is mocked for testing and can be swapped out for other cloud providers

const createQueue = async params => {
    return await sqs.createQueue(params).promise();
};

const getQueueUrl = async params => {
    return await sqs.getQueueUrl(params).promise();
};

const sendMessage = async params => {
	return await sqs.sendMessage(params).promise();
};
