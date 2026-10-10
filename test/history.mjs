import assert from "node:assert/strict";
import fs from "node:fs";
import { mock, test } from "node:test";
import { withAsideHistory } from "../server/history.ts";

async function fixture() {
  let emit;
  const sent = [];
  let closed = false;
  const connection = await withAsideHistory({
    id: "aside", label: "Aside",
    async connect() {
      return {
        send: async (input) => { sent.push(input); },
        onEvent: (listener) => { emit = listener; return () => {}; },
        close: async () => { closed = true; },
      };
    },
  }).connect({});
  const events = [];
  connection.onEvent((event) => events.push(event));
  return { connection, events, emit: (event) => emit(event), sent, isClosed: () => closed };
}

const open = (id = "acp-session") => ({
  type: "session.open", sessionId: "paseo-session", history: "replay",
  persistence: { data: { sessionId: id } },
});
const ready = { type: "session.ready", sessionId: "paseo-session" };

test("replay emits stable user and assistant messages before ready", async () => {
  const read = mock.method(fs, "readFileSync", () => JSON.stringify({ history: [
    { id: "u1", role: "user", text: "Hello" },
    { id: "a1", role: "assistant", text: "Hi" },
  ] }));
  try {
    const f = await fixture();
    await f.connection.send(open());
    f.emit(ready);
    assert.deepEqual(f.events.map((event) => event.type), ["timeline.item", "timeline.item", "session.ready"]);
    assert.deepEqual(f.events.slice(0, 2).map((event) => event.item), [
      { type: "user_message", id: "u1", text: "Hello" },
      { type: "assistant_message", id: "a1", text: "Hi" },
    ]);
    f.emit(ready);
    assert.equal(read.mock.callCount(), 1);
  } finally { read.mock.restore(); }
});

test("session IDs cannot cause reads outside the mapping directory", async () => {
  const read = mock.method(fs, "readFileSync", () => { throw new Error("Unexpected read"); });
  try {
    const f = await fixture();
    await f.connection.send(open("../config"));
    f.emit(ready);
    assert.equal(read.mock.callCount(), 0);
    assert.deepEqual(f.events, [ready]);
  } finally { read.mock.restore(); }
});

test("invalid saved history does not emit malformed timeline items", async () => {
  const read = mock.method(fs, "readFileSync", () => JSON.stringify({ history: [{ role: "tool", text: 42 }] }));
  try {
    const f = await fixture();
    await f.connection.send(open());
    f.emit(ready);
    assert.deepEqual(f.events, [ready]);
  } finally { read.mock.restore(); }
});

test("new sessions do not read replay history", async () => {
  const read = mock.method(fs, "readFileSync", () => { throw new Error("Unexpected read"); });
  try {
    const f = await fixture();
    await f.connection.send({ ...open(), history: "none" });
    f.emit(ready);
    assert.equal(read.mock.callCount(), 0);
  } finally { read.mock.restore(); }
});

test("requests, events and close delegate to the ACP provider", async () => {
  const f = await fixture();
  const input = { type: "prompt.message", text: "Test" };
  const event = { type: "turn.completed", sessionId: "paseo-session" };
  await f.connection.send(input);
  f.emit(event);
  await f.connection.close();
  assert.deepEqual(f.sent, [input]);
  assert.deepEqual(f.events, [event]);
  assert.equal(f.isClosed(), true);
});
