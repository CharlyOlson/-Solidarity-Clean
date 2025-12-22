"""
SOLIDARITY PLATFORM - QUANTUM ENGINE
====================================
 
TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
Owner: Scott Charles Olson
DOB: March 31, 1997
Phone: +1 (913) 548-5715
Location: Kansas, USA 66210
Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
"""

import argparse
import json
from typing import Dict, Any

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


def build_bell() -> QuantumCircuit:
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    return qc


def build_ghz3() -> QuantumCircuit:
    qc = QuantumCircuit(3)
    qc.h(0)
    qc.cx(0, 1)
    qc.cx(1, 2)
    return qc


def build_parity2() -> QuantumCircuit:
    qc = QuantumCircuit(2)
    qc.h([0, 1])
    qc.cz(0, 1)
    qc.h([0, 1])
    return qc


def build_phaseflip3() -> QuantumCircuit:
    qc = QuantumCircuit(3)
    qc.h(0)
    qc.cx(0, 1)
    qc.cx(0, 2)
    qc.z(1)
    qc.cx(0, 2)
    qc.cx(0, 1)
    qc.h(0)
    return qc


def run_experiment(name: str, shots: int) -> Dict[str, Any]:
    circuits = {
        "bell": build_bell,
        "ghz3": build_ghz3,
        "parity2": build_parity2,
        "phaseflip3": build_phaseflip3,
    }

    if name not in circuits:
        raise ValueError(f"Unsupported experiment: {name}")
    circuit = circuits[name]()
    state = Statevector.from_instruction(circuit)
    raw_counts = state.sample_counts(shots)
    counts = {k: int(v) for k, v in raw_counts.items()}

    return {
        "experiment": name,
        "shots": shots,
        "counts": counts,
        "backend": "statevector_sampler",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Solidarity Quantum Engine")
    parser.add_argument("experiment", choices=["bell", "ghz3", "parity2", "phaseflip3"], help="Quantum experiment to run")
    parser.add_argument("--shots", type=int, default=256, help="Number of shots for the experiment")
    args = parser.parse_args()

    payload = run_experiment(args.experiment, args.shots)
    print(json.dumps(payload))


if __name__ == "__main__":
    main()
