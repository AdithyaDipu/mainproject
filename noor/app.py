from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import numpy as np
import pickle

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["agroassist_db"]
predictions_collection = db["predictions"]

# Load machine learning model and scalers
model = pickle.load(open('model.pkl', 'rb'))
sc = pickle.load(open('standscaler.pkl', 'rb'))
ms = pickle.load(open('minmaxscaler.pkl', 'rb'))

@app.route("/")
def index():
    return "API is running."

@app.route("/predict", methods=['POST'])
def predict():
    try:
        data = request.json
        email = data.get("email", "unknown@example.com")  # Get email from the request
        project_name = data.get("projectName", "Unknown Project")
        category = data.get("category", "both")
        N = float(data['Nitrogen'])
        P = float(data['Phosporus'])
        K = float(data['Potassium'])
        temp = float(data['Temperature'])
        humidity = float(data['Humidity'])
        ph = float(data['Ph'])
        rainfall = float(data['Rainfall'])

        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)
        scaled_features = ms.transform(single_pred)
        final_features = sc.transform(scaled_features)

        probabilities = model.predict_proba(final_features)[0]
        top_10_indices = probabilities.argsort()[-10:][::-1]

        crop_dict = {
            1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya",
            7: "Orange", 8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Beans",
            12: "Mango", 13: "Banana", 14: "Pomegranate", 15: "Lentil", 16: "Blackgram",
            17: "Mungbean", 18: "Mothbeans", 19: "Pigeonpeas", 20: "Kidneybeans",
            21: "Chickpea", 22: "Coffee"
        }

        fruits = {5, 6, 7, 8, 9, 10, 12, 13, 14, 22}
        vegetables = {1, 2, 3, 4, 11, 15, 16, 17, 18, 19, 20, 21}

        filtered_crops = []
        for i in top_10_indices:
            crop_name = crop_dict.get(i + 1, "Unknown")
            if category == "fruits" and i + 1 in fruits:
                filtered_crops.append({"crop": crop_name, "probability": probabilities[i]})
            elif category == "vegetables" and i + 1 in vegetables:
                filtered_crops.append({"crop": crop_name, "probability": probabilities[i]})
            elif category == "both":
                filtered_crops.append({"crop": crop_name, "probability": probabilities[i]})

        document = {
            "email": email,  # Store email
            "project_name": project_name,
            "input_data": {
                "Nitrogen": N,
                "Phosporus": P,
                "Potassium": K,
                "Temperature": temp,
                "Humidity": humidity,
                "Ph": ph,
                "Rainfall": rainfall
            },
            "predictions": filtered_crops,
            "selected_crops": []
        }
        inserted_doc = predictions_collection.insert_one(document)

        return jsonify({"top_10_crops": filtered_crops, "document_id": str(inserted_doc.inserted_id)})

    except Exception as e:
        print("Error in prediction:", str(e))
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@app.route("/store-selected-crops", methods=['POST'])
def store_selected_crops():
    try:
        data = request.json
        email = data.get("email", "unknown@example.com")
        selected_crops = data.get("selected_crops", [])
        document_id = data.get("document_id")
        project_name = data.get("project_name", "Unknown Project")
        category = data.get("category", "both")

        if not selected_crops:
            return jsonify({"message": "No crops selected!"}), 400

        if not document_id:
            return jsonify({"message": "Document ID is required!"}), 400

        result = predictions_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {
                "email": email,  # Store email with the selected crops
                "selected_crops": selected_crops,
                "project_name": project_name,
                "category": category
            }}
        )

        if result.modified_count == 1:
            return jsonify({"message": "Selected crops updated successfully!"})
        else:
            return jsonify({"message": "Document not found or not updated!"}), 404

    except Exception as e:
        print("Error updating crops:", str(e))
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@app.route("/get-user-projects", methods=['GET'])
def get_user_projects():
    try:
        email = request.args.get("email")
        if not email:
            return jsonify({"message": "Email is required!"}), 400

        entries = list(predictions_collection.find({"email": email}))
        if not entries:
            return jsonify({"message": "No projects found for the given email!"}), 404

        for entry in entries:
            entry["_id"] = str(entry["_id"])

        return jsonify({"entries": entries})

    except Exception as e:
        print("Error fetching user projects:", str(e))
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@app.route("/get-crop-details", methods=['GET'])
def get_crop_details():
    try:
        crop_name = request.args.get("crop_name")
        if not crop_name:
            return jsonify({"message": "Crop name is required!"}), 400

        crop = db["crops"].find_one({"name": crop_name})
        if crop:
            crop["_id"] = str(crop["_id"])
            return jsonify(crop)
        else:
            return jsonify({"message": "Crop not found!"}), 404

    except Exception as e:
        print("Error fetching crop details:", str(e))
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
