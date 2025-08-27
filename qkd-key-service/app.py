from flask import Flask, jsonify, request
from flask_cors import CORS
from bb84 import run_bb84

app = Flask(__name__)
# Enable CORS to allow requests from our frontend (which will run on a different port)
CORS(app)

@app.route('/')
def index():
    return "<h1>QKD Key Generation Service</h1><p>Use the /generate-key endpoint to get a secure key.</p>"

@app.route('/generate-key', methods=['GET'])
def generate_key():
    """
    API endpoint to generate a secure key using the BB84 protocol.
    Accepts query parameters:
    - qubits: The number of qubits to use (default: 64)
    - eavesdrop: 'true' or 'false' to simulate an eavesdropper (default: false)
    """
    try:
        num_qubits = int(request.args.get('qubits', 64))
        eavesdrop_str = request.args.get('eavesdrop', 'false').lower()
        eavesdrop = eavesdrop_str == 'true'

        if num_qubits < 16 or num_qubits > 256:
            return jsonify({"status": "Error", "error": "Number of qubits must be between 16 and 256"}), 400

        result = run_bb84(num_qubits, eavesdrop)
        return jsonify(result)

    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)}), 500

if __name__ == '__main__':
    # We use port 5001 to avoid conflicts with other services
    app.run(debug=True, port=5001)
