import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("AGENT-ENTITY runtime context keeps entity and runtime distinct", () => {
  const schema = JSON.parse(fs.readFileSync(new URL("../schemas/agent-entity-runtime-context.v1.schema.json", import.meta.url), "utf8"));
  assert.ok(schema.required.includes("agent_entity_id"));
  assert.ok(schema.required.includes("runtime_binding_id"));
  assert.notEqual(schema.properties.agent_entity_id, schema.properties.runtime_binding_id);
  assert.deepEqual(schema.properties.revocation_state.enum, ["active", "suspended", "revoked", "expired"]);
});
