leaderboard_data = []

@app.route('/train', methods=['POST'])
def train():
    # ... (existing code)
    leaderboard_data.append({'loss': loss, 'accuracy': accuracy})
    leaderboard_data.sort(key=lambda x: x['loss'])  # Sort by lowest loss
    return jsonify({'loss': float(loss), 'accuracy': float(accuracy)})

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    return jsonify(leaderboard_data)
