const PROVIDER_SPECIFIC_FIELDS = new Set([
  'provider',
  'providerId',
  'model',
  'modelId',
  'endpoint',
  'apiKey',
  'credentials',
  'adapter',
  'generationParams',
  'higgsfield',
]);

const FAILURE_MESSAGES = Object.freeze({
  CREATOR_CORE_UNAVAILABLE: 'Creator Core capability is unavailable.',
  CREATOR_CORE_REQUEST_FAILED: 'Creator Core request failed.',
  INVALID_INPUT: 'Creative request must contain a non-empty request.',
  INVALID_DIRECTION_PLAN: 'Creator Core returned an invalid DirectionPlan.',
  PROVIDER_FIELDS_REJECTED: 'ShotSpec contains provider-specific fields.',
  GOVERNANCE_REQUIRED: 'A HERMES governance decision is required.',
});

function failure(code, governanceDecision) {
  return {
    ok: false,
    error: {
      code,
      message: FAILURE_MESSAGES[code],
      governed: true,
    },
    governanceDecision,
  };
}

function hasProviderSpecificField(value) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(hasProviderSpecificField);

  return Object.entries(value).some(([key, child]) => (
    PROVIDER_SPECIFIC_FIELDS.has(key) || hasProviderSpecificField(child)
  ));
}

function clone(value) {
  return structuredClone(value);
}

function validateDirectionPlan(directionPlan) {
  if (!directionPlan || typeof directionPlan !== 'object' || Array.isArray(directionPlan)) {
    return 'INVALID_DIRECTION_PLAN';
  }
  if (!directionPlan.shotSpec || typeof directionPlan.shotSpec !== 'object') {
    return 'INVALID_DIRECTION_PLAN';
  }
  if (!directionPlan.provenance || typeof directionPlan.provenance !== 'object') {
    return 'INVALID_DIRECTION_PLAN';
  }
  if (hasProviderSpecificField(directionPlan.shotSpec)) {
    return 'PROVIDER_FIELDS_REJECTED';
  }
  return null;
}

/**
 * Adapt HERMES requests to an injected Creator Core capability.
 * Creator Core owns interpretation and cinematic compilation; HERMES owns policy.
 */
export async function createDirectionPlan(input, context = {}, dependencies = {}) {
  const governanceDecision = context.governanceDecision;
  if (!governanceDecision) return failure('GOVERNANCE_REQUIRED');
  if (!input || typeof input.request !== 'string' || !input.request.trim()) {
    return failure('INVALID_INPUT', governanceDecision);
  }

  const creatorCore = dependencies.creatorCore;
  if (!creatorCore || typeof creatorCore.requestDirectionPlan !== 'function') {
    return failure('CREATOR_CORE_UNAVAILABLE', governanceDecision);
  }

  let result;
  try {
    result = await creatorCore.requestDirectionPlan(clone(input), clone(context));
  } catch {
    return failure('CREATOR_CORE_REQUEST_FAILED', governanceDecision);
  }

  const directionPlan = result?.directionPlan || result;
  const validationError = validateDirectionPlan(directionPlan);
  if (validationError) return failure(validationError, governanceDecision);

  return {
    ok: true,
    directionPlan: clone(directionPlan),
    provenance: clone(directionPlan.provenance),
    governanceDecision: clone(governanceDecision),
  };
}

export function validateDirectionPlanContract(directionPlan) {
  const code = validateDirectionPlan(directionPlan);
  return code ? failure(code) : { ok: true };
}

export const CreativeDirectorIntegration = Object.freeze({
  name: 'hermes-creator-core-creative-director',
  version: 1,
  role: 'governed-adapter',
  owner: 'AGENTROPOLIS-CREATOR-CORE',
  policyOwner: 'HERMES-CITY',
});
