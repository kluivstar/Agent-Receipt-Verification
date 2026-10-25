# GenLayer Protocol & Equivalence Principle Integration

## 1. What is GenLayer?

GenLayer is a blockchain network capable of executing **Intelligent Contracts** written in Python on the **GenVM** runtime. Unlike traditional EVM smart contracts that are limited to arithmetic and deterministic cryptography, GenLayer contracts can natively execute non-deterministic operations such as web access and Large Language Model (LLM) reasoning while preserving decentralized consensus.

## 2. Equivalence Principle Mechanism

Because LLMs and web scrapes return non-identical raw text across different validator nodes, GenLayer uses **Equivalence Principles** to reach consensus:

```python
def run_assessment():
    prompt = f"Evaluate deliverable against criteria..."
    return gl.nondet.exec_prompt(prompt, response_format="json")

# Equivalence consensus block
result_json = gl.eq_principle.prompt_non_comparative(
    run_assessment,
    criteria="Validators must agree on whether required criteria passed."
)
```

1. **Isolation**: Non-deterministic execution is constrained inside `gl.nondet`.
2. **Evaluation**: Each validator runs the closure independently.
3. **Equivalence Principle**: Validators execute a comparative or non-comparative consensus prompt to verify that all validator outputs satisfy the high-level criteria without requiring character-by-character identity.
4. **Finalization**: Once quorum is established, the contract state is committed.

## 3. Supported Networks in `genlayer-js`

| Network | Chain ID | Default RPC URL | Explorer URL |
| :--- | :--- | :--- | :--- |
| **StudioNet** | `61999` | `https://studio.genlayer.com/api` | `https://genlayer-explorer.vercel.app` |
| **Bradbury Testnet** | `4221` | `https://rpc-bradbury.genlayer.com` | `https://genlayer-explorer.vercel.app` |
| **Asimov Testnet** | `4221` | `https://asimov.genlayer.com/api` | `https://genlayer-explorer.vercel.app` |
| **Localnet Simulator** | `999` | `http://localhost:8545` | Local / Console |

## 4. Contract Security Guidelines
- **Strict Method Scoping**: Read methods must be decorated with `@gl.public.view`; state transitions must use `@gl.public.write`.
- **Runtime Dependency Header**: The first line of every GenLayer contract must declare its dependency version:
  ```python
  # { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
  ```
- **State Compactness**: Store cryptographic hashes (`agreementCommitment`, `submissionCommitment`) and summary references on-chain rather than multi-megabyte raw logs.
