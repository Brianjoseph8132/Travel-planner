from model import User,db
from flask import jsonify,request, Blueprint
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity


user_bp = Blueprint("user_bp", __name__)

# fetch all
@user_bp.route("/users", methods=["GET"])
def fetch_users():
    users = User.query.all()
    user_list = []
    for user in users:
        user_list.append({
            'id': user.id,
            'username': user.username,
            'email': user.email
        })
    return jsonify(user_list)

# Add user
@user_bp.route("/users", methods=["POST"])
def add_users():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = generate_password_hash(data['password']) 

    check_username = User.query.filter_by(username=username).first()
    check_email = User.query.filter_by(email=email).first()

    print("Email", check_email)
    print("Username", check_username)

    if check_username or check_email:
        return jsonify({"error":"Username/email exists"}), 404

    else:
        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"success": "Added successfully"}), 201
    


# Update User
@user_bp.route("/users/<int:user_id>", methods=["PATCH"])
@jwt_required()
def update_users(user_id):
    current_user_id = get_jwt_identity()

    if user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"})
    
    data = request.get_json()
    username = data.get('username', user.username)
    email = data.get('email', user.email)
    password = data.get('password', user.password)
    if password:
        password = generate_password_hash(password)
    else:
        password = user.password 

    
    check_username = User.query.filter(User.username == username, User.id != current_user_id).first()
    check_email = User.query.filter(User.email == email, User.id != current_user_id).first()

    if check_username or check_email:
        return jsonify({"error": "Username or email already exists"}), 406

        
    user.username = username
    user.email = email
    user.password = password

    db.session.commit()
    return jsonify({"success": "updated successfully"}), 200

    
# Delete
@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_users(user_id):
    current_user_id = get_jwt_identity()

    if user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User you are trying to delete doesn't exist"}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": "Deleted successfully"}), 200


    
   
    
    
    


# @user_bp.route('/users/trips_and_activities', methods=["GET"])
# @jwt_required()  # Ensure the user is authenticated
# def trips_and_activities():
#     current_user = get_jwt_identity()  # Get the user_id from the JWT token

#     # Fetch trips for the current user
#     trips = Trip.query.filter_by(user_id=current_user).all()

#     if not trips:
#         return jsonify({"message": "No trips or activities found for the user."}), 404

#     response = []
#     for trip in trips:
#         activities = trip.activities  # Access associated activities using the relationship
#         response.append({
#             "trip_id": trip.id,
#             "destination": trip.destination,
#             "start_date": trip.start_date.strftime('%Y-%m-%d'),
#             "end_date": trip.end_date.strftime('%Y-%m-%d'),
#             "budget": trip.budget,
#             "status": trip.status,
#             "activities": [
#                 {
#                     "activity_id": activity.id,
#                     "name": activity.name,
#                     "description": activity.description,
#                     "scheduled_time": activity.scheduled_time.strftime('%H:%M')
#                 }
#                 for activity in activities
#             ]
#         })

#     return jsonify(response), 200
