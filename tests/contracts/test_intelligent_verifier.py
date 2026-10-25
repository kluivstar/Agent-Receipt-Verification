import sys
import os
import json
import pytest

# Add contracts directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../contracts")))

from agent_receipt_verifier import AgentReceiptVerifier
from conftest import MockNondet

@pytest.fixture
def contract():
    return AgentReceiptVerifier()

@pytest.fixture
def sample_task(contract):
    task_id = "tsk_test_01"
    criteria = [
        {"id": "c1", "title": "Latency", "passCondition": "Latency < 50ms", "required": True},
        {"id": "c2", "title": "Audit", "passCondition": "Zero criticals", "required": True}
    ]
    contract.register_task(
        task_id=task_id,
        title="Automated Test Task",
        requester="0xRequester123",
        assigned_agent="0xAgent456",
        deliverable_type="URL_REPORT",
        criteria_json=json.dumps(criteria),
        agreement_commitment="0xhash123456"
    )
    return task_id

def test_task_registration(contract):
    criteria = [{"id": "c1", "title": "Test", "passCondition": "Pass", "required": True}]
    success = contract.register_task(
        task_id="tsk_unique_01",
        title="Unit Task",
        requester="0xUserA",
        assigned_agent="0xAgentB",
        deliverable_type="TEXT_ANALYSIS",
        criteria_json=json.dumps(criteria),
        agreement_commitment="0xcommitment001"
    )
    assert success is True
    task = contract.get_task("tsk_unique_01")
    assert task["title"] == "Unit Task"
    assert task["status"] == "OPEN"

def test_prevent_duplicate_task_registration(contract, sample_task):
    criteria = [{"id": "c1", "title": "Test", "passCondition": "Pass", "required": True}]
    with pytest.raises(AssertionError, match="already registered"):
        contract.register_task(
            task_id=sample_task,
            title="Duplicate Task",
            requester="0xUserA",
            assigned_agent="0xAgentB",
            deliverable_type="URL_REPORT",
            criteria_json=json.dumps(criteria),
            agreement_commitment="0xcommitment002"
        )

def test_submit_deliverable_success(contract, sample_task):
    evidence = ["https://evidence.example.com/run.json"]
    success = contract.submit_deliverable(
        task_id=sample_task,
        submission_id="sub_test_01",
        submitter="0xAgent456",
        deliverable_url="https://report.example.com/benchmark",
        deliverable_content="Comprehensive benchmark completed",
        evidence_urls_json=json.dumps(evidence),
        submission_commitment="0xsubhash999"
    )
    assert success is True
    submission = contract.get_submission("sub_test_01")
    assert submission["status"] == "PENDING"
    task = contract.get_task(sample_task)
    assert task["status"] == "SUBMITTED"

def test_prevent_unauthorized_submitter(contract, sample_task):
    evidence = []
    with pytest.raises(AssertionError, match="Submitter does not match"):
        contract.submit_deliverable(
            task_id=sample_task,
            submission_id="sub_bad_agent",
            submitter="0xUnauthorizedHacker",
            deliverable_url="https://evil.com",
            deliverable_content="Malicious payload",
            evidence_urls_json=json.dumps(evidence),
            submission_commitment="0xbadhash"
        )

def test_evaluate_accepted_submission(contract, sample_task):
    contract.submit_deliverable(
        task_id=sample_task,
        submission_id="sub_accept_01",
        submitter="0xAgent456",
        deliverable_url="https://report.example.com/benchmark",
        deliverable_content="Full benchmark passes all SLA criteria",
        evidence_urls_json=json.dumps(["https://evidence.com/log.json"]),
        submission_commitment="0xcommitAccept"
    )

    MockNondet.current_mock_response = json.dumps({
        "decision": "ACCEPTED",
        "rationale": "All criteria met with complete log evidence",
        "perCriterionResults": [
            {"criterionId": "c1", "title": "Latency", "passed": True, "score": 0.98, "rationale": "Latency 42ms"},
            {"criterionId": "c2", "title": "Audit", "passed": True, "score": 1.0, "rationale": "Zero issues"}
        ],
        "missingEvidence": [],
        "confidenceScore": 0.97
    })

    receipt_id = contract.evaluate_submission(sample_task, "sub_accept_01")
    assert receipt_id == "rcpt_sub_accept_01"

    receipt = contract.get_receipt(receipt_id)
    assert receipt["decision"] == "ACCEPTED"
    assert receipt["verification_status"] == "CONFIRMED_ON_CHAIN"

    task = contract.get_task(sample_task)
    assert task["status"] == "ACCEPTED"

def test_evaluate_rejected_submission(contract, sample_task):
    contract.submit_deliverable(
        task_id=sample_task,
        submission_id="sub_reject_01",
        submitter="0xAgent456",
        deliverable_url="https://report.example.com/bad",
        deliverable_content="Partial progress only",
        evidence_urls_json=json.dumps([]),
        submission_commitment="0xcommitReject"
    )

    MockNondet.current_mock_response = json.dumps({
        "decision": "REJECTED",
        "rationale": "Critical criterion failed due to missing test run and zero evidence",
        "perCriterionResults": [
            {"criterionId": "c1", "title": "Latency", "passed": False, "score": 0.2, "rationale": "No latency data"},
            {"criterionId": "c2", "title": "Audit", "passed": True, "score": 0.9, "rationale": "Verified"}
        ],
        "missingEvidence": ["Latency run logs"],
        "confidenceScore": 0.91
    })

    receipt_id = contract.evaluate_submission(sample_task, "sub_reject_01")
    receipt = contract.get_receipt(receipt_id)
    assert receipt["decision"] == "REJECTED"

    task = contract.get_task(sample_task)
    assert task["status"] == "REJECTED"

def test_prevent_submission_on_accepted_task(contract, sample_task):
    contract.submit_deliverable(
        task_id=sample_task,
        submission_id="sub_first",
        submitter="0xAgent456",
        deliverable_url="https://valid.com",
        deliverable_content="Valid",
        evidence_urls_json=json.dumps([]),
        submission_commitment="0xcommit1"
    )

    MockNondet.current_mock_response = json.dumps({
        "decision": "ACCEPTED",
        "rationale": "Passed",
        "perCriterionResults": [],
        "missingEvidence": [],
        "confidenceScore": 0.95
    })
    contract.evaluate_submission(sample_task, "sub_first")

    # Attempting another submission on completed task must revert
    with pytest.raises(AssertionError, match="Cannot submit deliverable for task in status ACCEPTED"):
        contract.submit_deliverable(
            task_id=sample_task,
            submission_id="sub_late",
            submitter="0xAgent456",
            deliverable_url="https://late.com",
            deliverable_content="Late",
            evidence_urls_json=json.dumps([]),
            submission_commitment="0xcommitLate"
        )
