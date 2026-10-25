import sys
import types
import json
import pytest

# Create an in-memory mock for the GenLayer runtime environment
class MockMessage:
    sender = "0xRequesterAddress0001"

class MockNondet:
    current_mock_response = None

    @staticmethod
    def exec_prompt(prompt: str, response_format: str = "json") -> str:
        if MockNondet.current_mock_response:
            return MockNondet.current_mock_response
        return json.dumps({
            "decision": "ACCEPTED",
            "rationale": "All criteria met per LLM simulation",
            "perCriterionResults": [],
            "missingEvidence": [],
            "confidenceScore": 0.95
        })

class MockEqPrinciple:
    @staticmethod
    def prompt_non_comparative(fn, criteria: str = ""):
        # Executes the non-deterministic closure and simulates validator consensus
        return fn()

class MockPublic:
    @staticmethod
    def view(fn):
        fn.__is_view__ = True
        return fn

    @staticmethod
    def write(fn):
        fn.__is_write__ = True
        return fn

class MockContract:
    pass

class GenLayerGl:
    Contract = MockContract
    public = MockPublic
    message = MockMessage
    nondet = MockNondet
    eq_principle = MockEqPrinciple

# Inject mock into sys.modules if genlayer is not installed
if "genlayer" not in sys.modules:
    genlayer_mod = types.ModuleType("genlayer")
    genlayer_mod.gl = GenLayerGl
    genlayer_mod.Address = str
    sys.modules["genlayer"] = genlayer_mod

@pytest.fixture
def mock_genlayer():
    return GenLayerGl
