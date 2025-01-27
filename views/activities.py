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





# Add activites
@activity_bp.route("/activities", methods=["POST"])
@jwt_required()
def add_activities():
    data = request.get_json()
    current_user_id = get_jwt_identity()

    # Extract and validate input fields
    name = data.get('name')
    description = data.get('description')
    scheduled_time_str = data.get('scheduled_time')  # Assuming input is in HH:MM format
    trip_id = data.get('trip_id')

    if not (name and description and scheduled_time_str and trip_id):
        return jsonify({"error": "Missing required fields"}), 400

    # Validate the time format (HH:MM)
    try:
        scheduled_time = datetime.strptime(scheduled_time_str, '%H:%M').time()
    except ValueError:
        return jsonify({"error": "Invalid time format. Use HH:MM"}), 400

    # Combine the time with the current date
    today = datetime.now().date()  # Use today's date, or replace with a specific date if required
    scheduled_datetime = datetime.combine(today, scheduled_time)

    # Verify if the trip exists and belongs to the current user
    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    if trip.user_id != current_user_id:
        return jsonify({"error": "Unauthorized to add activity for this trip"}), 403

    # Check if an activity with this name already exists for the same trip
    check_name = Activity.query.filter_by(name=name, trip_id=trip_id).first()
    if check_name:
        return jsonify({"error": "Activity with this name already exists for this trip"}), 400

    # Create the new activity with combined date and time
    new_activity = Activity(
        name=name,
        description=description,
        trip_id=trip_id,
        scheduled_time=scheduled_datetime
    )

    db.session.add(new_activity)
    db.session.commit()

    return jsonify({"success": "Added successfully"}), 201



# Update activities
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
        scheduled_time_str = data.get('scheduled_time', activity.scheduled_time)  # Expecting 'HH:MM' format
        trip_id = data.get('trip_id', activity.trip_id)

        # Validate time format (HH:MM)
        try:
            # Ensure it's in HH:MM format
            if scheduled_time_str and datetime.strptime(scheduled_time_str, '%H:%M'):
                scheduled_time = scheduled_time_str
            else:
                scheduled_time = activity.scheduled_time
        except ValueError:
            return jsonify({"error": "Invalid time format. Use HH:MM"}), 400

        # Check if activity name already exists
        check_name = Activity.query.filter(Activity.name == name, Activity.id != activity.id).first()
        
        if check_name:
            return jsonify({"error": "Activity name already exists"}), 400
        
        # Update only the fields that were passed in the request
        activity.name = name
        activity.description = description
        activity.scheduled_time = scheduled_time  # Store time as string (HH:MM)
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




    



    

