/**
 *  js/__tests__/index.test.js
 *
 *    Unit tests for index.js
 *
 */

const index = require('../index');

const { sqsClient } = require('../aws-sqs.js');
	  
jest.mock('../aws-sqs.js');

beforeEach(() => {
	sqsClient.send.mockReset();
});

// Tests for buildQueueName(event) from index.js

const theAllUnknownQueue = index.QueueNameVars.UNKNOWN_APP + '-' +
                           index.QueueNameVars.UNKNOWN_ENV + '-' +
						   index.QueueNameVars.UNKNOWN_SOURCE + '-' +
						   index.QueueNameVars.UNKNOWN_TYPE;

test('index.buildQueueName(): Null Event', () => {
	expect(index.buildQueueName(null, null)).toBe(theAllUnknownQueue);
});

test('index.buildQueueName(): Empty Event', () => {
	let e = new Event(null, null);
	expect(index.buildQueueName(e)).toBe(theAllUnknownQueue);
});

test('index.buildQueueName(): Proper Queue Name', () => {
	process.env.APP_NAME = 'MyApp';
	process.env.ENV = 'prod';
	let body = '{"source":"azurerepos", "type":"pullRequest"}';
	let e = new Event(body, null);
	expect(index.buildQueueName(e)).toBe('MyApp-prod-azurerepos-pullRequest');
});

test('index.buildQueueName(): Event With Null Body & Headers', () => {
	process.env.APP_NAME = 'MyApp';
	process.env.ENV = 'prod';
	let e = new Event(null, null);
	expect(index.buildQueueName(e)).toBe('MyApp-prod-UnknownSource-UnknownType');
});

// Tests for getSource(event) from index.js

test('index.getSource(): Null Event', () => {
	expect(index.getSource(null)).toBe(index.QueueNameVars.UNKNOWN_SOURCE);
});

test('index.getSource(): Empty Event', () => {
	let e = new Event(null, null);
	expect(index.getSource(e)).toBe(index.QueueNameVars.UNKNOWN_SOURCE);
});

test('index.getSource(): Message Body Contains Source Field', () => {
	let body = '{"source":"vcs-system"}';
	let e = new Event(body, null);
	expect(index.getSource(e)).toBe('vcs-system');
});

test('index.getSource(): GitHub HTTP Header', () => {
	let headers = ['x-github-event'];
	let e = new Event(null, headers);
	expect(index.getSource(e)).toBe('github');
});

test('index.getSource(): Unknown Header', () => {
	let headers = ['x-vcs-event'];
	let e = new Event(null, headers);
	expect(index.getSource(e)).toBe(index.QueueNameVars.UNKNOWN_SOURCE);
});

// Tests for getType(event) from index.js

test('index.getType(): Null Event', () => {
	expect(index.getType(null)).toBe(index.QueueNameVars.UNKNOWN_TYPE);
});

test('index.getType(): Empty Event', () => {
	let e = new Event(null, null);
	expect(index.getType(e)).toBe(index.QueueNameVars.UNKNOWN_TYPE);
});

test('index.getType(): Message Body Contains Type Field', () => {
	let body = '{"type":"push"}';
	let e = new Event(body, null);
	expect(index.getType(e)).toBe('push');
});

// Tests for handler(event) from index.js

test('index.handler(): Queue Already Exists and Message Sent', async () => {
	process.env.APP_NAME = 'MyApp';
	process.env.ENV = 'mock';
	let queue = new MockQueue('abc');
	let msg = new MockMessage(123);
	sqsClient.send.mockReturnValueOnce(queue)
				  .mockReturnValueOnce(msg);
	
	let response = await index.handler(
	      new Event('{"source":"mars","type":"greeting"}', null));
	expect(response.statusCode == 200);
});

test('index.handler(): Queue Needs Creation and Message Sent', async () => {
	process.env.APP_NAME = 'MyApp';
	process.env.ENV = 'mock';
	let e = new Event('{"source":"mars","type":"greeting"}', null);
	let queue = new MockQueue(index.buildQueueName(e));
	let msg = new MockMessage(123);
	sqsClient.send.mockReturnValueOnce(null)
				  .mockReturnValueOnce(queue)
				  .mockReturnValueOnce(msg);
	let response = await index.handler(e);
	expect(response.statusCode == 200);
});

// Dummy test structs

class Event {
	constructor(body, headers) {
		this.body = body;
		this.headers = headers;
	}
	getBody() { return this.body; }
	getHeaders() { return this.headers; }
}

class MockQueue {
	constructor(url, msgId) {
		this.QueueUrl = url;
	}
	getQueueUrl() { return this.QueueUrl; }
}

class MockMessage {
	constructor(msgId) {
		this.MessageId = msgId;
	}
	getMessageId() { return this.MessageId; }
}
