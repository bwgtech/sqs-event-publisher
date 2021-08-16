/**
 *  js/index.js
 *
 *    Lambda handler
 *
 *    Routes incoming json to SQS based on headers and message elements.
 *
 *    Dynamically creates SQS queues to match the constructed 4-tuple.
 *
 */

const { SQSClient, GetQueueUrlCommand, CreateQueueCommand, SendMessageCommand } 
    = require('@aws-sdk/client-sqs');
	
const SQS = new SQSClient({ region: process.env.AWS_REGION });
		
exports.handler = async (event) => {
    console.log(event);
	
	// Some initial default values in case things go awry
	let responseCode = 500;
	let responseTxt = 'Unknown Error Processing Request';
	
	let queueName = buildQueueName(event);
    
	// Check if a queue with the desired name already exists
	let queueUrl = null;
    try {
		const getQueueCommand = new GetQueueUrlCommand({QueueName: queueName});
        let existingQ = await SQS.send(getQueueCommand);
		queueUrl = existingQ.QueueUrl;
        console.log('Queue named [' + queueName + '] already exists ' +
		      'with URL [' + queueUrl + ']');
    } catch (error) {
        console.log('Error from getQueueUrl (expected if queue named ' + 
			  queueName + 'does ' + 'not exist): ' + error);
    }
    
	// If queue does not already exist, create it
    if (queueUrl == null) {
        try {
        	const createQueueCommand = 
			      new CreateQueueCommand({QueueName: queueName});
        	let newQ = await SQS.send(createQueueCommand);
            //let newQ = await SQS.createQueue({QueueName: queueName});
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
			const sendMessageCommand = new SendMessageCommand(sendParams);
			let msg = await SQS.send(sendMessageCommand);
			//let msg = await SQS.sendMessage(sendParams);
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
        statusCode: responseCode,
        body: responseTxt
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
 *
 * <Application Name> - <Environment> - <Source> - <Message/Operation Type>
 *
 *   @param {object} event The Lambda event object
 *   @return {string} The constructed queue name (@see QueueNameVars for values 
 *     that this can contain if certain tokens were undeterminable.
 */
function buildQueueName(event) {
  let appName = QueueNameVars.UNKNOWN_APP;
  let env = QueueNameVars.UNKNOWN_ENV;
  try {
	  if (typeof process.env.APP_NAME != 'undefined') {
		  appName = process.env.APP_NAME;
	  }
	  if (typeof process.env.ENV != 'undefined') {
		  env = process.env.ENV
	  }
  } catch (error) { }
  return appName + '-' + env + '-' + getSource(event) + '-' + getType(event);
}
module.exports.buildQueueName = buildQueueName;

/**
 * Determines the source of the event by first checking if the field named 
 * 'source' is present in the message body (which is expected to be JSON).  If 
 * not found, HTTP headers are inspected for known sources.
 *
 *   @param {object} event The Lambda event object
 *   @return {string} The source string (or "UnknownSource" if no source 
 *     could be determined).
 */
function getSource(event) {
  try {
	  let json = JSON.parse(event.body);
	  let source = json.source;
	  if (source != null) {
		  return source;
	  }
  } catch (error) { }
  
  try {
	  if (event.headers.indexOf('x-github-event') > -1 ) {
		  return 'github';
	  }
	  // Additional header inspection can go here
  } catch (error) { }
  
  return QueueNameVars.UNKNOWN_SOURCE;
}
module.exports.getSource = getSource;

/**
 * Determines the source of the event by first checking if the field named 
 * 'source' is present in the message body (which is expected to be JSON).  If 
 * not found, HTTP headers are inspected for known sources.
 *
 *   @param {object} event The Lambda event object
 *   @return {string} The type string (or "UnknownType" if no type could 
 *     be determined).
 */
function getType(event) {
	try {
		let json = JSON.parse(event.body);
		let type = json.type;
		if (type != null) {
			return type;
		}
	} catch (error) { }
	
	try {
		let type = event.headers[('x-github-event')];
		if (type != null) {
			return type;
		}
		// Additional header inspection can go here
	} catch (error) { }
	
	return QueueNameVars.UNKNOWN_TYPE;
}
module.exports.getType = getType;
