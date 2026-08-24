import test from "node:test";
import assert from "node:assert/strict";
import {
  createDirectionPlan,
  validateDirectionPlanContract,
} from "../src/director/creative-director/index.js";

const governanceDecision = {
  policyState: "approved-bounded",
  receiptId: "receipt-test-001",
  authority: "human-mission-control",
};

const input = {
  request: "She enters the nightclub and everyone knows she is dangerous.",
  conversation_context: "Keep the performance restrained.",
  reference_tags: ["nightclub", "restrained-danger"],
};

function validPlan(overrides = {}) {
  return {
    originalUserIntent: input.request,
    dramaticObjective: "Establish restrained danger through presence.",
    inferenceProvenance: {
      dramaticObjective: "INFERRED",
      performanceDirection: "INFERRED",
    },
    provenance: {
      source: "creator-core",
      requestId: "creator-request-001",
      referenceTags: input.reference_tags,
    },
    assumptions: ["The nightclub is active and visually legible."],
    uncertainties: [],
    questions: [],
    shotSpec: {
      schema: "cinedance.shotspec.v1",
      subject: "the woman",
      performanceDirection: "Minimal movement; controlled eye-line.",
      staging: { entry: "walks into the nightclub", crowd: "parts subtly" },
      composition: { priority: "subject" },
      pacing: { beats: ["entry", "recognition"] },
    },
    ...overrides,
  };
}

test("Creator Core unavailable returns an explicit governed failure", async () => {
  const result = await createDirectionPlan(input, { governanceDecision });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "CREATOR_CORE_UNAVAILABLE");
  assert.equal(result.error.governed, true);
  assert.deepEqual(result.governanceDecision, governanceDecision);
});

test("valid DirectionPlan is accepted and governance is preserved", async () => {
  const plan = validPlan();
  const result = await createDirectionPlan(input, { governanceDecision }, {
    creatorCore: { requestDirectionPlan: async () => plan },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.directionPlan, plan);
  assert.deepEqual(result.provenance, plan.provenance);
  assert.deepEqual(result.governanceDecision, governanceDecision);
});

test("malformed ShotSpec is rejected", async () => {
  const result = await createDirectionPlan(input, { governanceDecision }, {
    creatorCore: { requestDirectionPlan: async () => validPlan({ shotSpec: null }) },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "INVALID_DIRECTION_PLAN");
});

test("provider-specific ShotSpec fields are rejected without injection", async () => {
  const result = await createDirectionPlan(input, { governanceDecision }, {
    creatorCore: {
      requestDirectionPlan: async () => validPlan({ shotSpec: { schema: "cinedance.shotspec.v1", provider: "higgsfield" } }),
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "PROVIDER_FIELDS_REJECTED");
});

test("Creator Core provenance is preserved exactly", async () => {
  const plan = validPlan({ provenance: { source: "creator-core", loreStatus: "proposed", sourceRefs: ["ref-1"] } });
  const result = await createDirectionPlan(input, { governanceDecision }, {
    creatorCore: { requestDirectionPlan: async () => plan },
  });
  assert.deepEqual(result.provenance, plan.provenance);
  assert.deepEqual(result.directionPlan.provenance, plan.provenance);
});

test("missing governance fails closed", async () => {
  const result = await createDirectionPlan(input, {}, {
    creatorCore: { requestDirectionPlan: async () => validPlan() },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "GOVERNANCE_REQUIRED");
});

test("provider errors and secrets are not exposed by the governed failure", async () => {
  const secret = "sk-test-secret-must-not-escape";
  const result = await createDirectionPlan(input, { governanceDecision }, {
    creatorCore: {
      requestDirectionPlan: async () => {
        throw new Error(`provider apiKey=${secret}`);
      },
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "CREATOR_CORE_REQUEST_FAILED");
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test("contract validator rejects provider-specific fields", () => {
  const result = validateDirectionPlanContract(validPlan({
    shotSpec: { schema: "cinedance.shotspec.v1", modelId: "secret-model" },
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "PROVIDER_FIELDS_REJECTED");
});
