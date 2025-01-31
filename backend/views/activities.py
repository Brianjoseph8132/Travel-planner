from model import db, Activity, Trip
from flask import jsonify,request, Blueprint
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity


activity_bp = Blueprint("activity_bp", __name__)


# ============================activities========================================
# fetch activities
@activity_bp.route("/activities", methods=["GET"])
@jwt_required()
def fetch_activities():
    current_user_id = get_jwt_identity()
    
    # Fetch all activities where the current user is the owner of the related trip
    activities = Activity.query.join(Trip).filter(Trip.user_id == current_user_id).all()
    
    activity_list = []
    for activity in activities:
        activity_list.append({
            'id': activity.id,
            'name': activity.name,
            'description': activity.description,
            'scheduled_time': activity.scheduled_time,  
            'trip_id': activity.trip_id
        })
    
    return jsonify(activity_list)




# Add
@activity_bp.route("/activities", methods=["POST"])
@jwt_required()
def add_activities():
    data = request.get_json()
    current_user_id = get_jwt_identity()

    print("Received Data:", data)  # Debugging: Check incoming data

    name = data.get('name')
    description = data.get('description')
    scheduled_time = data.get('scheduled_time')  # Expecting "HH:MM" format
    trip_id = data.get('trip_id')

    if not all([name, description, scheduled_time, trip_id]):
        return jsonify({"error": "Missing required fields"}), 400

    # Ensure scheduled_time is in HH:MM format
    try:
        # Try parsing the time to ensure it's valid
        datetime.strptime(scheduled_time, '%H:%M')
    except ValueError:
        return jsonify({"error": "Invalid time format. Use HH:MM"}), 400

    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    if trip.user_id != current_user_id:
        return jsonify({"error": "Unauthorized to add activity for this trip"}), 403

    # Check if an activity with this name already exists for the trip
    check_name = Activity.query.filter_by(name=name, trip_id=trip_id).first()
    if check_name:
        return jsonify({"error": "Activity with this name already exists for this trip"}), 400

    new_activity = Activity(
        name=name,
        description=description,
        scheduled_time=scheduled_time,  # Store time directly as a string
        trip_id=trip_id
    )

    db.session.add(new_activity)
    db.session.commit()

    print("Activity added successfully!")  # Debugging

    return jsonify({"success": "Added successfully"}), 201




# update
@activity_bp.route("/activities/<int:activity_id>", methods=["PUT"])
@jwt_required()
def update_activities(activity_id):
    activity = Activity.query.get(activity_id)
    current_user_id = get_jwt_identity()

    if activity:
        # Ensure that the activity belongs to the trip owned by the current user
        if activity.trip.user_id != current_user_id:
            return jsonify({"error": "Unauthorized to update this activity"}), 403

        # Get the data, with defaults being the existing values
        data = request.get_json()
        name = data.get('name', activity.name)
        description = data.get('description', activity.description)
        
        # Only update the scheduled_time if it's provided, otherwise keep the existing value
        scheduled_time = data.get('scheduled_time', None)
        if scheduled_time:
            try:
                # Ensure it's in HH:MM format and convert to time
                scheduled_time = datetime.strptime(scheduled_time, '%H:%M').time()
                # Convert datetime.time to string in HH:MM format
                scheduled_time = scheduled_time.strftime('%H:%M')
            except ValueError:
                return jsonify({"error": "Invalid time format. Use HH:MM"}), 400
        else:
            scheduled_time = activity.scheduled_time  # Retain the current value if not provided

        trip_id = data.get('trip_id', activity.trip_id)

        # Check if activity name already exists
        check_name = Activity.query.filter(Activity.name == name, Activity.id != activity.id).first()
        
        if check_name:
            return jsonify({"error": "Activity name already exists"}), 400
        
        # Update only the fields that were passed in the request
        activity.name = name
        activity.description = description
        activity.scheduled_time = scheduled_time  # Now it's a string (HH:MM)
        activity.trip_id = trip_id

        db.session.commit()
        return jsonify({"success": "Updated successfully"}), 200
    else:
        return jsonify({"error": "Activity not found"}), 404



# Delete Activities
@activity_bp.route("/activities/<int:activity_id>", methods=["DELETE"])
@jwt_required()  # Ensure the user is authenticated
def delete_activities(activity_id):
    activity = Activity.query.get(activity_id)
    current_user_id = get_jwt_identity()  # Get the current user's ID from the JWT token

    if activity:
        # Check if the current user is the owner of the trip
        if activity.trip.user_id != current_user_id:
            return jsonify({"error": "Unauthorized to delete this activity"}), 403
        
        # Proceed to delete the activity
        db.session.delete(activity)
        db.session.commit()
        return jsonify({"success": "Deleted successfully"}), 200
    else:
        return jsonify({"error": "Activity you are trying to delete doesn't exist"}), 406




    



    

