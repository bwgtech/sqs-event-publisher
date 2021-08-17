const { SQSClient } = require('@aws-sdk/client-sqs');
	
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

module.exports = { sqsClient };