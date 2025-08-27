import numpy as np
from qiskit import QuantumCircuit, Aer, transpile, assemble
from qiskit.visualization import plot_histogram
import json

# Use the Aer simulator
simulator = Aer.get_backend('qasm_simulator')

def run_bb84(num_qubits=64, eavesdrop=False):
    """
    Simulates the BB84 protocol.

    Args:
        num_qubits (int): The number of qubits to use for the key exchange.
        eavesdrop (bool): If True, an eavesdropper (Eve) will intercept the qubits.

    Returns:
        dict: A dictionary containing the final key, a detailed log of the process,
              and the final status ('Success' or 'Aborted').
    """
    logs = []

    # --- Step 1: Alice generates her bits and bases ---
    alice_bits = np.random.randint(2, size=num_qubits)
    alice_bases = np.random.randint(2, size=num_qubits) # 0 for Z basis (+), 1 for X basis (x)
    logs.append(f"[ALICE] Generated {num_qubits} random bits and bases.")

    def encode_qubits(bits, bases):
        """Encodes bits into qubits based on the chosen bases."""
        encoded_qubits = []
        for i in range(len(bits)):
            qc = QuantumCircuit(1, 1)
            if bases[i] == 0: # Prepare in Z-basis
                if bits[i] == 1:
                    qc.x(0)
            else: # Prepare in X-basis
                if bits[i] == 0:
                    qc.h(0)
                else:
                    qc.x(0)
                    qc.h(0)
            encoded_qubits.append(qc)
        return encoded_qubits

    alice_qubits = encode_qubits(alice_bits, alice_bases)
    logs.append("[ALICE] Encoded bits into qubits based on chosen bases.")
    logs.append("[CHANNEL] Alice is sending qubits to Bob...")

    # --- (Optional) Step 2: Eve intercepts and measures ---
    if eavesdrop:
        eve_bases = np.random.randint(2, size=num_qubits)
        intercepted_bits = []
        logs.append("[HACKER ALERT] Eavesdropper (Eve) is intercepting the quantum channel!")
        for i, qc in enumerate(alice_qubits):
            if eve_bases[i] == 1: # Eve measures in X-basis
                qc.h(0)
            qc.measure(0, 0)

            # Simulate the measurement
            t_qc = transpile(qc, simulator)
            qobj = assemble(t_qc, shots=1)
            result = simulator.run(qobj).result()
            measured_bit = int(list(result.get_counts())[0])
            intercepted_bits.append(measured_bit)

        # Eve resends new qubits based on her measurements
        alice_qubits = encode_qubits(intercepted_bits, eve_bases)
        logs.append("[HACKER ALERT] Eve measured the qubits and sent new ones to Bob.")


    # --- Step 3: Bob measures the qubits ---
    bob_bases = np.random.randint(2, size=num_qubits)
    bob_bits = []
    logs.append("[BOB] Received qubits and is generating his own random bases for measurement.")
    for i in range(num_qubits):
        qc = alice_qubits[i]
        if bob_bases[i] == 1: # Measure in X-basis
            qc.h(0)
        qc.measure(0, 0)

        # Simulate the measurement
        t_qc = transpile(qc, simulator)
        qobj = assemble(t_qc, shots=1)
        result = simulator.run(qobj).result()
        measured_bit = int(list(result.get_counts())[0])
        bob_bits.append(measured_bit)
    logs.append("[BOB] Successfully measured all received qubits.")

    # --- Step 4: Sifting - Alice and Bob compare bases ---
    logs.append("[PUBLIC CHANNEL] Alice and Bob are now publicly comparing their bases.")
    sifted_alice_bits = []
    sifted_bob_bits = []
    for i in range(num_qubits):
        if alice_bases[i] == bob_bases[i]:
            sifted_alice_bits.append(alice_bits[i])
            sifted_bob_bits.append(bob_bits[i])

    sifted_key_len = len(sifted_alice_bits)
    logs.append(f"[PUBLIC CHANNEL] Basis comparison complete. {sifted_key_len} bits remain in the sifted key.")

    # --- Step 5: Error Checking / Eavesdropper Detection ---
    if sifted_key_len == 0:
        logs.append("[ERROR] No matching bases found. Cannot establish a key.")
        return {"status": "Aborted", "key": "", "log": logs}

    # They sacrifice a portion of the key to check for errors
    sample_size = int(sifted_key_len / 2)
    bit_check_indices = np.random.choice(range(sifted_key_len), sample_size, replace=False)

    mismatches = 0
    for i in bit_check_indices:
        if sifted_alice_bits[i] != sifted_bob_bits[i]:
            mismatches += 1

    logs.append(f"[PUBLIC CHANNEL] Alice and Bob are comparing {sample_size} random bits from their sifted keys to check for errors.")

    error_rate = mismatches / sample_size if sample_size > 0 else 0
    logs.append(f"[SYSTEM] Calculated error rate: {error_rate:.2%}")

    if error_rate > 0.1: # If error rate is high, assume eavesdropper
        logs.append("[HACKER DETECTED] High error rate detected! Communication is compromised. Aborting key exchange.")
        return {"status": "Aborted", "key": "", "log": logs}
    else:
        # If secure, the remaining bits form the final key
        final_key_bits = [sifted_bob_bits[i] for i in range(sifted_key_len) if i not in bit_check_indices]
        final_key = "".join(map(str, final_key_bits))
        logs.append(f"[SUCCESS] Communication channel is secure. Final key of length {len(final_key)} established.")
        return {"status": "Success", "key": final_key, "log": logs}