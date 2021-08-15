/**
 *  index.test.js
 *
 *  Lambda handler unit tests
 *
 */

const index = require('../index');

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

// Dummy test structs

class Event {
	constructor(body, headers) {
		this.body = body;
		this.headers = headers;
	}
	getBody() { return this.body; }
	getHeaders() { return this.headers; }
}
