from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
import joblib
import tensorflow as tf
import numpy as np
from datetime import datetime, timedelta
from model.model import train_model

app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)  # Token valid for 30 minutes
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017/")  # Replace with your MongoDB connection string
db = client['backpropagation_challenge']
users_collection = db['users']
leaderboard_collection = db['leaderboard']
models_collection = db['models']  # New collection for saving models


# Load the trained model when the Flask app starts
try:
    model_1 = joblib.load('decision_tree_model.pkl')  # Ensure this path is correct
except FileNotFoundError:
    print("Error: decision_tree_model.pkl not found. Make sure the model file exists.")




# Retrieve user's saved models
@app.route('/load-models', methods=['GET'])
@jwt_required()
def load_models():
    current_user = get_jwt_identity()
    user_models = list(models_collection.find({"username": current_user}))
    
    # Exclude the MongoDB internal '_id' field and convert ObjectId to string
    for model in user_models:
        model['_id'] = str(model['_id'])
    
    return jsonify(user_models), 200



# User registration
@app.route('/signup', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if users_collection.find_one({'username': username}):
        return jsonify({"msg": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    users_collection.insert_one({
        'username': username,
        'password': hashed_password
    })

    return jsonify({"msg": "User registered successfully"}), 201

# User login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({'username': username})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)


# Fetch profile
@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    user = users_collection.find_one({'username': current_user}, {'_id': 0, 'password': 0})

    if user:
        return jsonify(user), 200
    else:
        return jsonify({"msg": "User not found"}), 404

# Update profile
@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()
    data = request.json
    update_data = {'username': data.get('username')}

    result = users_collection.update_one({'username': current_user}, {'$set': update_data})

    if result.matched_count > 0:
        return jsonify({"msg": "Profile updated successfully"}), 200
    else:
        return jsonify({"msg": "User not found"}), 404





# Load the trained model when the Flask app starts
# model_1 = joblib.load('decision_tree_model.pkl')

# Route for prediction
# @app.route('/predict', methods=['POST'])
# @jwt_required()
# def predict():
#     try:
#         current_user = get_jwt_identity()  # Get user identity from the JWT token
#         data = request.json

#         # Extract input features
#         features = [
#                 'national_inv', 'lead_time', 'sales_1_month', 'pieces_past_due', 'perf_6_month_avg',
#                 'in_transit_qty', 'local_bo_qty', 'deck_risk', 'oe_constraint', 'ppap_risk',
#                 'stop_auto_buy', 'rev_stop'
#             ]
        
#         # input_data = [data.get(feature) for feature in features]
        
#         # Extract input data and ensure all features are present
#         input_data = []
#         for feature in features:
#             value = data.get(feature)
#             if value is None:  # If any feature is missing, return an error
#                 return jsonify({"msg": f"Missing value for {feature}"}), 400
#             input_data.append(value)
        

#         # Convert the input data into a format that your model understands
#         input_data = np.array([input_data])

#         # Load your trained model (use joblib or pickle)
#         model = model_1  # Assuming you're using the decision tree model for prediction

#         # Get the prediction
#         prediction = model.predict(input_data)
#         prediction_value = int(prediction[0])

#         # return jsonify({'prediction': int(prediction[0])}), 200
#         # prediction = model.predict(input_data)

#         # Save the prediction along with the user
#         prediction_data = {
#             'username': current_user,
#             'prediction': prediction_value,
#             'input_data': data,  # Store the user inputs as well
#             'timestamp': datetime.now()
#         }

#         leaderboard_collection.insert_one(prediction_data)

#         return jsonify({'prediction': int(prediction[0])}), 200
    
#     except Exception as e:
#         return jsonify({'msg': str(e)}), 500


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Process the input data and return a prediction
        input_data = request.get_json()
        
        # Assuming you're passing a list of input features to the model
        prediction = model_1.predict([list(input_data.values())])
        
        # Convert the prediction to a Python native type (e.g., int)
        prediction_value = int(prediction[0])  # Convert numpy int64 to Python int

        return jsonify({'prediction': prediction_value})
    except Exception as e:
        # If an error occurs, return a helpful message
        return jsonify({'msg': str(e)}), 500







# Route for fetching prediction history
@app.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    try:
        current_user = get_jwt_identity()  # Get the current user

        # Retrieve the user's prediction history from the database
        history = leaderboard_collection.find({'username': current_user}).sort('timestamp', -1)
        
        # Format the history data to return
        history_list = [
            {
                'prediction': entry['prediction'],
                'input_data': entry['input_data'],
                'timestamp': entry['timestamp'].isoformat()  # Format timestamp as a string
            }
            for entry in history
        ]

        return jsonify(history_list), 200
    except Exception as e:
        return jsonify({'msg': str(e)}), 500







# Neural network training route
@app.route('/train', methods=['POST'])
@jwt_required()
async def train():
    current_user = get_jwt_identity()
    data = request.json
    
    if not data or 'x_train' not in data or 'y_train' not in data:
        return jsonify({"msg": "Invalid data format"}), 422

    x_train = np.array(data['x_train'])
    y_train = np.array(data['y_train'])   
    
    # Example training process (replace with your train_model function)
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(10, activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.fit(x_train, y_train, epochs=5)

    loss, accuracy = model.evaluate(x_train, y_train)
    
    leaderboard_collection.insert_one({
        'loss': loss,
        'accuracy': accuracy,
        'username': current_user
    })

    return jsonify({'loss': float(loss), 'accuracy': float(accuracy)})

# Save neural network model
@app.route('/save-model', methods=['POST'])
@jwt_required()
def save_model():
    current_user = get_jwt_identity()
    model_data = request.json  # Expecting model data to be sent as JSON

    models_collection.insert_one({
        "username": current_user,
        "model": model_data,
        "created_at": datetime.now()
    })
    
    return jsonify({"msg": "Model saved successfully"}), 200

# Leaderboard route
@app.route('/leaderboard', methods=['GET'])
@jwt_required()
def leaderboard():
    leaderboard_data = list(leaderboard_collection.find().sort("loss", 1))
    return jsonify(leaderboard_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
