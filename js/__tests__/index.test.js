const index = require('../index');


// Tests for buildQueueName(rawPath, source, type) from index.js

const theAllUnknownQueue = "UnknownApp-UnknownEnv-UnknownSource-UnknownType";

test('index.buildQueueName(): Null Event and Params', () => {
	expect(index.buildQueueName(null, null, null)).toBe(theAllUnknownQueue);
});

test('index.buildQueueName(): Empty Event with Null Params', () => {
	expect(index.buildQueueName(new Event(null, null), null, null)).toBe(theAllUnknownQueue);
});


// Tests for getSource(event) from index.js

test('index.getSource(): Null Event', () => {
	expect(index.getSource(null)).toBe("UnknownSource");
});

test('index.getSource(): Empty Event', () => {
	expect(index.getSource(new Event(null, null))).toBe("UnknownSource");
});

test('index.getSource(): Message Body Contains Source Field', () => {
	let body = new Body("vcs-system", null);
	let event = new Event(body, null);
	expect(index.getSource(event)).toBe('vcs-system');
});

test('index.getSource(): GitHub HTTP Header', () => {
	let headers = ['x-github-event'];
	let event = new Event(null, headers);
	expect(index.getSource(event)).toBe('github');
});

test('index.getSource(): Unknown Header', () => {
	let headers = ['x-vcs-event'];
	let event = new Event(null, headers);
	expect(index.getSource(event)).toBe('UnknownSource');
});


// Tests for getType(event) from index.js

test('index.getType(): Null Event', () => {
	expect(index.getType(null)).toBe("UnknownType");
});

test('index.getType(): Empty Event', () => {
	let event = new Event(null, null);
	expect(index.getType(event)).toBe("UnknownType");
});

test('index.getType(): Message Body Contains Source Field', () => {
	let body = new Body(null, "push");
	let event = new Event(body, null);
	expect(index.getType(event)).toBe('push');
});



// Dummy test structs

class Event {
	constructor(body, headers) {
		this.body = body;
		this.headers = headers;
	}
	getBody() {
		return this.body;
	}
	getHeaders() {
		return this.headers;
	}
}

class Body {
	constructor(source, type) {
		this.source = source;
		this.type = type;
	}
	getSource() {
		return this.source;
	}
	getType() {
		return this.type;
	}
}
