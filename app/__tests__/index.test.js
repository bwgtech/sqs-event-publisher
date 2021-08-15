const index = require('../index');

test('index.getSource(): Null Event', () => {
	expect(index.getSource(null)).toBe("UnknownSource");
});

test('index.getSource(): Empty Event', () => {
	let event = new Event(null, null);
	expect(index.getSource(event)).toBe("UnknownSource");
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

test('index.getSource(): Body Contains Source Field', () => {
	let body = new Body("vcs-system", null);
	let event = new Event(body, null);
	expect(index.getSource(event)).toBe('vcs-system');
});

/*
 *  Dummy test structs
 *
 */

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
