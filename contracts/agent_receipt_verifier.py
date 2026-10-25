# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class AgentReceiptVerifier(gl.Contract):
    """
    AgentReceiptVerifier: Decentralized Intelligent Contract for Task Verification.
    Adjudicates AI agent deliverables against agreed-upon acceptance criteria using
    GenLayer's intelligent execution and equivalence principle consensus.
    """
    owner: Address
    tasks: dict[str, dict]
    submissions: dict[str, dict]
    evaluations: dict[str, dict]
    receipts: dict[str, dict]

    def __init__(self):
        self.owner = gl.message.sender
        self.tasks = {}
        self.submissions = {}
        self.evaluations = {}
        self.receipts = {}

    # --- STATE-CHANGING METHODS (@gl.public.write) ---

    @gl.public.write
    def register_task(
        self,
        task_id: str,
        title: str,
        requester: Address,
        assigned_agent: str,
        deliverable_type: str,
        criteria_json: str,
        agreement_commitment: str
    ) -> bool:
        """
        Registers a new task agreement commitment.
        Immutable once created to prevent retroactive changes by requesters.
        """
        assert task_id not in self.tasks, f"Task '{task_id}' already registered"
        assert len(task_id) > 0, "Task ID cannot be empty"
        assert len(title) > 0, "Title cannot be empty"
        assert len(agreement_commitment) > 0, "Agreement commitment is required"

        # Validate that criteria is valid JSON
        criteria = json.loads(criteria_json)
        assert isinstance(criteria, list) and len(criteria) > 0, "At least one acceptance criterion is required"

        self.tasks[task_id] = {
            "id": task_id,
            "title": title,
            "requester": requester,
            "assigned_agent": assigned_agent,
            "deliverable_type": deliverable_type,
            "criteria_json": criteria_json,
            "agreement_commitment": agreement_commitment,
            "status": "OPEN",
            "active_submission_id": ""
        }
        return True

    @gl.public.write
    def submit_deliverable(
        self,
        task_id: str,
        submission_id: str,
        submitter: Address,
        deliverable_url: str,
        deliverable_content: str,
        evidence_urls_json: str,
        submission_commitment: str
    ) -> bool:
        """
        Records a deliverable submission tied to a registered task.
        """
        assert task_id in self.tasks, f"Task '{task_id}' does not exist"
        task = self.tasks[task_id]
        
        # State machine guards
        assert task["status"] not in ["ACCEPTED", "CANCELLED"], f"Cannot submit deliverable for task in status {task['status']}"
        assert submission_id not in self.submissions, f"Submission '{submission_id}' already exists"
        
        # Check assigned agent if specified
        if task["assigned_agent"] and task["assigned_agent"] != "":
            assert str(submitter).lower() == task["assigned_agent"].lower() or task["assigned_agent"] == "*", "Submitter does not match assigned agent"

        self.submissions[submission_id] = {
            "id": submission_id,
            "task_id": task_id,
            "submitter": submitter,
            "deliverable_url": deliverable_url,
            "deliverable_content": deliverable_content,
            "evidence_urls_json": evidence_urls_json,
            "submission_commitment": submission_commitment,
            "status": "PENDING"
        }

        # Update task state
        task["status"] = "SUBMITTED"
        task["active_submission_id"] = submission_id
        self.tasks[task_id] = task
        return True

    @gl.public.write
    def evaluate_submission(
        self,
        task_id: str,
        submission_id: str
    ) -> str:
        """
        Executes decentralized intelligent adjudication of the submission
        against original agreement criteria using GenLayer's non-deterministic
        LLM execution inside an equivalence principle consensus block.
        """
        assert task_id in self.tasks, f"Task '{task_id}' not found"
        assert submission_id in self.submissions, f"Submission '{submission_id}' not found"

        task = self.tasks[task_id]
        submission = self.submissions[submission_id]

        assert submission["task_id"] == task_id, "Submission is not for this task"
        assert submission["status"] != "ACCEPTED", "Submission already finalized as accepted"
        assert submission_id not in self.evaluations, f"Submission '{submission_id}' already has a completed evaluation"

        # Prepare evaluation context
        criteria = json.loads(task["criteria_json"])
        deliverable_url = submission["deliverable_url"]
        deliverable_content = submission["deliverable_content"]
        evidence_urls = json.loads(submission["evidence_urls_json"])

        # Non-deterministic intelligent adjudication closure
        def run_intelligent_assessment() -> str:
            prompt = f"""
            You are an impartial GenLayer Intelligent Contract Adjudicator.
            Evaluate whether the provided AI agent deliverable satisfies the agreed acceptance criteria.

            TASK: {task['title']}
            AGREEMENT COMMITMENT: {task['agreement_commitment']}
            
            ACCEPTANCE CRITERIA:
            {json.dumps(criteria, indent=2)}

            SUBMISSION DELIVERABLE:
            URL: {deliverable_url}
            Content / Summary: {deliverable_content}

            SUPPORTING EVIDENCE URLS:
            {json.dumps(evidence_urls)}

            Respond ONLY in valid, parseable JSON with this exact schema:
            {{
              "decision": "ACCEPTED" | "REJECTED" | "NEEDS_REVIEW",
              "rationale": "Clear, concise objective justification",
              "perCriterionResults": [
                {{
                  "criterionId": "id string",
                  "title": "criterion title",
                  "passed": true | false,
                  "score": float between 0.0 and 1.0,
                  "rationale": "Brief finding for this criterion"
                }}
              ],
              "missingEvidence": ["list of any required evidence items not found"],
              "confidenceScore": float between 0.0 and 1.0
            }}
            """
            
            # Non-deterministic LLM prompt inside GenVM
            llm_response = gl.nondet.exec_prompt(prompt, response_format="json")
            return llm_response

        # Use GenLayer Equivalence Principle for decentralized validator consensus
        equivalence_criteria = (
            "Validators must agree on whether all required criteria passed, "
            "and on the high-level decision (ACCEPTED, REJECTED, or NEEDS_REVIEW)."
        )
        
        adjudication_json_str = gl.eq_principle.prompt_non_comparative(
            run_intelligent_assessment,
            criteria=equivalence_criteria
        )

        parsed_eval = json.loads(adjudication_json_str)
        decision = parsed_eval.get("decision", "NEEDS_REVIEW")
        if decision not in ["ACCEPTED", "REJECTED", "NEEDS_REVIEW"]:
            decision = "NEEDS_REVIEW"

        # Persist Evaluation
        eval_id = f"eval_{submission_id}"
        self.evaluations[submission_id] = {
            "id": eval_id,
            "task_id": task_id,
            "submission_id": submission_id,
            "decision": decision,
            "rationale": parsed_eval.get("rationale", "Evaluated by GenLayer Intelligent Contract"),
            "per_criterion_results_json": json.dumps(parsed_eval.get("perCriterionResults", [])),
            "missing_evidence_json": json.dumps(parsed_eval.get("missingEvidence", [])),
            "confidence_score": parsed_eval.get("confidenceScore", 0.9),
            "evaluator": "GENLAYER_INTELLIGENT_CONTRACT"
        }

        # Persist Receipt
        receipt_id = f"rcpt_{submission_id}"
        self.receipts[receipt_id] = {
            "id": receipt_id,
            "task_id": task_id,
            "submission_id": submission_id,
            "evaluation_id": eval_id,
            "decision": decision,
            "agreement_commitment": task["agreement_commitment"],
            "submission_commitment": submission["submission_commitment"],
            "verification_status": "CONFIRMED_ON_CHAIN"
        }

        # Update Task & Submission statuses
        if decision == "ACCEPTED":
            task["status"] = "ACCEPTED"
            submission["status"] = "ACCEPTED"
        elif decision == "REJECTED":
            task["status"] = "REJECTED"
            submission["status"] = "REJECTED"
        else:
            task["status"] = "NEEDS_REVIEW"
            submission["status"] = "EVALUATING"

        self.tasks[task_id] = task
        self.submissions[submission_id] = submission

        return receipt_id

    # --- VIEW METHODS (@gl.public.view) ---

    @gl.public.view
    def get_task(self, task_id: str) -> dict:
        """Returns task information or empty dict if not found."""
        return self.tasks.get(task_id, {})

    @gl.public.view
    def get_submission(self, submission_id: str) -> dict:
        """Returns submission information or empty dict if not found."""
        return self.submissions.get(submission_id, {})

    @gl.public.view
    def get_evaluation(self, submission_id: str) -> dict:
        """Returns evaluation information or empty dict if not found."""
        return self.evaluations.get(submission_id, {})

    @gl.public.view
    def get_receipt(self, receipt_id: str) -> dict:
        """Returns receipt information or empty dict if not found."""
        return self.receipts.get(receipt_id, {})
