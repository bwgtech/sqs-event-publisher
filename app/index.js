var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-1'});

exports.handler = async (event) => {
//exports.handler = async function(event, context) {
    console.log(event);
    const jsonText = event.body;
    const json = JSON.parse(jsonText);
    const source = json.source;
    const type = json.type;
    
    const queueName = 'TestQueue1'
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/106302556033/' + queueName;

    var params = {
        DelaySeconds: 0,
        MessageBody: jsonText,
        QueueUrl: queueUrl
    };
    
    var status = 'Unknown';
    try {
        var result = await sqs.sendMessage(params).promise();
        status = 'Sent message with ID [' + result.MessageId + '] to queue [' + queueName + ']';
    } catch (error) {
        console.log(error);
        status = "Error sending message to queue: " + error;
    }
    console.log(status);
    
    const response = {
        statusCode: 200,
        body: status
    };
    return response;
    
};
