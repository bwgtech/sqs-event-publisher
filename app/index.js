var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-1'});

exports.handler = async (event) => {
//exports.handler = async function(event, context) {
    console.log(event);
    const jsonText = event.body;
    const json = JSON.parse(jsonText);
    
    var source = 'UnknownSource';
    var type = "UnknownType";
    const githubEventHeader = event.headers[('x-github-event')];
    if (githubEventHeader) {
        source = "GitHub";
        type = githubEventHeader;
    }
    console.log('message source is [' + source + '], type is [' + type + ']');
    
    const queueName = source + "-" + type;
    var queueUrl = null;
    try {
        var obj = await getQueueUrl({QueueName: queueName});
        queueUrl = obj.QueueUrl;
        console.log('Queue named [' + queueName + '] already exists with URL [' + queueUrl + ']');
    } catch (error) {
        console.log('Error from getQueueUrl (expected if queue does not exist): ' + error);
    }
          
    if (queueUrl == null) {
        try {
            var queue = await createQueue({QueueName: queueName});
            queueUrl = queue.QueueUrl;
            console.log("Created queue with URL: " + queueUrl);
        } catch (error) {
            console.log(error);
        }
    }
    
    if (queueUrl == null) {
        //TODO
    }

    var sendParams = {
        DelaySeconds: 0,
        MessageBody: jsonText,
        QueueUrl: queueUrl
    };
    
    var status = 'Unknown';
    try {
        var msg = await sendMessage(sendParams);
        status = 'Sent message with ID [' + msg.MessageId + '] to queue [' + queueName + ']';
    } catch (error) {
        console.log(error);
        status = 'Error sending message to queue: ' + error;
    }
    console.log(status);
    
    const response = {
        statusCode: 200,
        body: status
    };
    return response;
    
};

const createQueue = async params => {
    return await sqs.createQueue(params).promise();
};

const getQueueUrl = async params => {
    return await sqs.getQueueUrl(params).promise();
};

const sendMessage = async params => {
	return await sqs.sendMessage(params).promise();
};

