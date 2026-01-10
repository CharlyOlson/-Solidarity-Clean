
"""
Quantum Engine for Solidarity Platform
Implements quantum circuit simulation, benchmarking, and Ollama AI integration with safety guards.
"""


import time
import json
from typing import Optional, Dict, Any, Tuple

# --- Import guards for optional dependencies ---
try:
    from qiskit import QuantumCircuit
    from qiskit.providers.aer import Aer
    from qiskit import execute
except ImportError:
    QuantumCircuit = None
    Aer = None
    execute = None
    print("[WARNING] qiskit is not installed. Quantum functions will not work.")

try:
    try:
        import requests
    except ImportError:
        requests = None  # Will raise error if used without install
except ImportError:
    requests = None
    print("[WARNING] requests is not installed. Ollama API calls will not work.")

# Constants
PHI = 1.618033988749
BRIDGING_BASELINE = 0.618

def phi_modulate(value: float) -> float:
    """Apply phi ratio modulation."""
    return value * PHI

def baseline_modulate(value: float) -> float:
    """Apply bridging baseline modulation."""
    return value * BRIDGING_BASELINE

from typing import Dict, Any

def safe_json_loads(data: str) -> Dict[str, Any]:
    try:
        return json.loads(data)
    except Exception:
        return {}  # type: Dict[str, Any]

def print_status(msg: str) -> None:
    print(f"[ENGINE] {msg}")

def build_quantum_circuit(depth: int = 14) -> Any:
    """Build a quantum circuit with phi-modulated RX gates."""
    if QuantumCircuit is None:
        raise ImportError("qiskit is not installed.")
    qc = QuantumCircuit(depth, depth)
    for i in range(depth):
        qc.h(i)
        qc.rx(PHI, i)
    qc.measure(range(depth), range(depth))
    return qc

def run_quantum_simulation(depth: int = 14, shots: int = 1000) -> Dict[str, int]:
    """Run quantum simulation and return measurement counts."""
    if Aer is None or execute is None:
        raise ImportError("qiskit is not installed.")
    simulator = Aer.get_backend('qasm_simulator')
    qc = build_quantum_circuit(depth)
    result = execute(qc, simulator, shots=shots).result()
    counts = result.get_counts(qc)
    return counts

def benchmark_quantum_engine(depth: int = 14, shots: int = 1000) -> Tuple[Dict[str, int], float]:
    """Benchmark quantum engine performance."""
    print_status(f"Benchmarking quantum engine: depth={depth}, shots={shots}")
    start = time.time()
    counts = run_quantum_simulation(depth, shots)
    duration = time.time() - start
    print_status(f"Completed in {duration:.3f}s")
    return counts, duration


def ollama_query(prompt: str, model: str = 'llama3.2:3b', safety_level: float = BRIDGING_BASELINE) -> str:
    """Query Ollama local AI API."""
    if requests is None:
        return '[ERROR: requests not installed]'
    url = 'http://localhost:11434/api/generate'
    payload = {
        'model': model,
        'prompt': prompt,
        'options': {
            'temperature': 0.4,
            'num_predict': 4000
        }
    }
    try:
        resp = requests.post(url, json=payload, timeout=30)
        if resp.status_code == 200:
            return safe_json_loads(resp.text).get('response', '')
        else:
            print_status(f"Ollama error: {resp.status_code}")
            return ''
    except Exception as e:
        print_status(f"Ollama exception: {e}")
        return ''




def train_ollama_with_quantum_result(result: Dict[str, Any], user_instruction: Optional[str] = None) -> str:
    """
    Send quantum experiment result and user instruction to Ollama for 'training' or analysis.
    Now supports dynamic scope, metrics, and flexible request/response adaptation.
    SAFETY GUARD: Only allow safe, non-malicious instructions and results.
    """

    # --- SAFETY: Validate experiment result structure ---
    required_keys = {"experiment", "counts"}
    if not isinstance(result, dict) or not required_keys.issubset(result.keys()):
        return "[SAFETY ERROR: Invalid experiment result structure]"

    # --- SAFETY: Validate user instruction ---
    def is_instruction_safe(instr: str) -> bool:
        if not isinstance(instr, str) or len(instr) > 1000:
            return False
        forbidden = {"<script", "</script", "import os", "import sys", "rm -rf", "shutdown", "hack", "exploit", "bypass", "token:", "api_key:"}
        lowered = instr.lower()
        return not any(word in lowered for word in forbidden)

    if user_instruction and not is_instruction_safe(user_instruction):
        return "[SAFETY ERROR: Forbidden or invalid instruction]"

    # --- Context Construction ---
    context_lines = [
        "You are a quantum AI assistant. Here is the result of a quantum experiment.",
        "You can adapt your analysis, metrics, and suggestions dynamically based on the user's request.",
        "Experiment result: {}".format(json.dumps(result, indent=2))
    ]

    if user_instruction:
        context_lines.append("User instruction: {}".format(user_instruction))
        lowered = user_instruction.lower()
        if "metrics" in lowered:
            context_lines.append("Please provide detailed metrics and statistical analysis.")
        # Extract scope and analysis_type in a single pass
        for line in user_instruction.splitlines():
            lline = line.lower().strip()
            if lline.startswith("scope:"):
                context_lines.append("Scope: {}".format(line.split(":", 1)[1].strip()))
            elif lline.startswith("analysis_type:"):
                context_lines.append("Analysis type: {}".format(line.split(":", 1)[1].strip()))

    context_lines.append("Respond with insights, training suggestions, next steps, and adapt your output to the requested scope or metrics.")
    context = "\n".join(context_lines)
    return ollama_query(context)



# --- STUB FOR run_experiment ---
def run_experiment(experiment: str, shots: int) -> Dict[str, Any]:
    """Stub for run_experiment. Replace with actual implementation."""
    return {"experiment": experiment, "shots": shots, "counts": {"0": shots // 2, "1": shots // 2}}



# --- Main entry point ---
def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="Solidarity Quantum Engine")
    parser.add_argument("experiment", choices=["bell", "ghz3", "parity2", "phaseflip3"], help="Quantum experiment to run")
    parser.add_argument("--shots", type=int, default=256, help="Number of shots for the experiment")
    parser.add_argument("--ollama", action="store_true", help="Send result to Ollama for analysis/training")
    parser.add_argument("--instruction", type=str, default=None, help="Custom instruction for Ollama training")
    args = parser.parse_args()

    # Safety guard: limit shots and experiment
    if not (1 <= args.shots <= 1000000):
        print(json.dumps({"error": "[SAFETY ERROR: shots out of allowed range]"}))
        return
    allowed_experiments = {"bell", "ghz3", "parity2", "phaseflip3"}
    if args.experiment not in allowed_experiments:
        print(json.dumps({"error": "[SAFETY ERROR: experiment not allowed]"}))
        return

    payload = run_experiment(args.experiment, args.shots)
    print(json.dumps(payload))

    if args.ollama:
        print("\n[Ollama API] Sending experiment result for analysis/training...")
        response = train_ollama_with_quantum_result(payload, args.instruction)
        print("\n[Ollama Response]\n" + response)


if __name__ == "__main__":
    main()
