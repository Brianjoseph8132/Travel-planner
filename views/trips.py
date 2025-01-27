from model import User,db, Trip, TripStatusEnum
from flask import jsonify,request, Blueprint
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity


trip_bp = Blueprint("trip_bp", __name__)


# =============================Trip=================
@trip_bp.route("/trips", methods=["GET"])
@jwt_required()
def fetch_trips():
    current_user_id =get_jwt_identity()
    trips = Trip.query.filter_by(user_id= current_user_id)
    today = datetime.now().date()  # Get today's date
    trips_list = []
    for trip in trips:
        # Automatically update the status if the end date has passed
        if trip.end_date < today and trip.status != TripStatusEnum.COMPLETED.value:
            trip.status = TripStatusEnum.COMPLETED.value
            db.session.commit()  # Commit the status change

        trips_list.append({
            'id': trip.id,
            'destination': trip.destination,
            'start_date': trip.start_date,
            'end_date': trip.end_date,
            'budget': trip.budget,
            'user_id': trip.user_id,
            'status': trip.status,
            'user': {
                "id": trip.user.id,
                "username": trip.user.username,
                "email": trip.user.email
            },
            'activities': [
                {
                    "id": activity.id,
                    "name": activity.name,
                    "description": activity.description,
                    "scheduled_time": activity.scheduled_time
                }
                for activity in trip.activities
            ]
        })
    return jsonify(trips_list)



# add trip
@trip_bp.route("/trips", methods=["POST"])
@jwt_required()
def add_trips():
    data = request.get_json()
    current_user_id =get_jwt_identity()

    destination = data['destination']
    start_date = data['start_date']
    end_date = data['end_date']
    budget = data['budget']
   


   # Validate date format
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Validate trip dates
    today = datetime.now().date()
    if start_date < today:
        return jsonify({"error": "Start date cannot be in the past"}), 400
    if end_date < today:
        return jsonify({"error": "End date cannot be in the past"}), 400
    if start_date >= end_date:
        return jsonify({"error": "Start date must be before end date"}), 400

    # Check for duplicate destination for the same user
    existing_trip = Trip.query.filter_by(destination=destination, user_id=current_user_id).first()
    if existing_trip:
        return jsonify({"error": "A trip with the same destination already exists for this user"}), 400
    else:
        new_trip = Trip(
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            user_id=current_user_id,
            status=TripStatusEnum.PENDING.value
        )
        db.session.add(new_trip)
        db.session.commit()
        return jsonify({"success": "Added successfully"}), 201
    

# update trips
@trip_bp.route("/trips/<int:trip_id>", methods=["PUT"])
@jwt_required()
def update_trips(trip_id):
    current_user_id = get_jwt_identity()
    trip = Trip.query.get(trip_id)

    if trip and trip.user_id==current_user_id:
        data = request.get_json()
        
        # Only update fields that are provided in the request
        destination = data.get('destination', trip.destination)
        start_date = data.get('start_date', trip.start_date.strftime('%Y-%m-%d'))
        end_date = data.get('end_date', trip.end_date.strftime('%Y-%m-%d'))
        budget = data.get('budget', trip.budget)
        

        # Validate date format if provided
        try:
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if isinstance(end_date, str):
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        # Validate trip dates only if they are being updated
        today = datetime.now().date()
        if start_date and start_date < today:
            return jsonify({"error": "Start date cannot be in the past"}), 400
        if end_date and end_date < today:
            return jsonify({"error": "End date cannot be in the past"}), 400
        if start_date and end_date and start_date >= end_date:
            return jsonify({"error": "Start date must be before end date"}), 400

        # Check for duplicate destination only if it is being updated
        if destination != trip.destination:
            existing_trip = Trip.query.filter_by(destination=destination, user_id=current_user_id).first()
            if existing_trip and existing_trip.id != trip.id:
                return jsonify({"error": "A trip with the same destination already exists for this user"}), 400

        # Update only the fields that changed
        trip.destination = destination
        trip.start_date = start_date
        trip.end_date = end_date
        trip.budget = budget
        

        # Automatically update the status if the end date has passed
        if end_date < today and trip.status != TripStatusEnum.COMPLETED.value:
            trip.status = TripStatusEnum.COMPLETED.value

        db.session.commit()  # Commit the changes
        return jsonify({"success": "Updated successfully"}), 200
    else:
        return jsonify({"error": "Trip not found"}), 404


# delete trip
# delete trip
@trip_bp.route("/trips/<int:trip_id>", methods=["DELETE"])
@jwt_required()
def delete_trips(trip_id):
    current_user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first() 

    if trip:  
        db.session.delete(trip)
        db.session.commit()
        return jsonify({"success": "Deleted successfully"}), 200
    
    else:
        return jsonify({"error": "Trip you are trying to delete doesn't exist"}), 406

