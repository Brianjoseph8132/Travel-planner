from flask import Flask, jsonify, request
from flask_migrate import Migrate
from model import User, Trip, Activity, db, TripStatusEnum
from datetime import datetime
app = Flask(__name__)

# migration initialization
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///travel.db'
migrate = Migrate(app, db)
db.init_app(app)


#User
@app.route("/users", methods=["GET"])
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
@app.route("/users", methods=["POST"])
def add_users():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']

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
@app.route("/users/<int:user_id>", methods=["PATCH"])
def update_users(user_id):
    user = User.query.get(user_id)

    if user:
        data = request.get_json()
        username = data.get('username', user.username)
        email = data.get('email', user.email)
        password = data.get('password', user.password)

        check_username = User.query.filter(User.username == username, User.id != user.id).first()
        check_email = User.query.filter(User.email == email, User.id != user.id).first()

        if check_username or check_email:
            return jsonify({"error": "Username or email already exists"}), 400

        else:
            user.username = username
            user.email = email
            user.password = password

            db.session.commit()
            return jsonify({"success": "updated successfully"}), 201

    
# Delete
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_users(user_id):
    user = User.query.get(user_id)

    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"success": "Deleted successfully"}), 200
    
    else:
        return jsonify({"error":"user you are trying to delete doesn't exist"}), 406
    



# =============================Trip=================
@app.route("/trips", methods=["GET"])
def fetch_trips():
    trips = Trip.query.all()
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
        })
    return jsonify(trips_list)





# add trip
@app.route("/trips", methods=["POST"])
def add_trips():
    data = request.get_json()
    destination = data['destination']
    start_date = data['start_date']
    end_date = data['end_date']
    budget = data['budget']
    user_id = data['user_id']


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
    existing_trip = Trip.query.filter_by(destination=destination, user_id=user_id).first()
    if existing_trip:
        return jsonify({"error": "A trip with the same destination already exists for this user"}), 400
    else:
        new_trip = Trip(
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            user_id=user_id,
            status=TripStatusEnum.PENDING.value
        )
        db.session.add(new_trip)
        db.session.commit()
        return jsonify({"success": "Added successfully"}), 201
    

# update trips
@app.route("/trips/<int:trip_id>", methods=["PUT"])
def update_trips(trip_id):
    trip = Trip.query.get(trip_id)

    if trip:
        data = request.get_json()
        destination = data.get('destination', trip.destination)
        start_date = data.get('start_date', trip.start_date)
        end_date = data.get('end_date', trip.end_date)
        budget = data.get('budget', trip.budget)
        user_id = data.get('user_id', trip.user_id)

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
        existing_trip = Trip.query.filter_by(destination=destination, user_id=user_id).first()
        if existing_trip:
            return jsonify({"error": "A trip with the same destination already exists for this user"}), 400
        else:
            # Update the trip object
            trip.destination = destination
            trip.start_date = start_date
            trip.end_date = end_date
            trip.budget = budget
            trip.user_id = user_id

            # Automatically update the status if the end date has passed
            if end_date < today and trip.status != TripStatusEnum.COMPLETED.value:
                trip.status = TripStatusEnum.COMPLETED.value

            db.session.commit()  # Commit the changes
            return jsonify({"success": "Updated successfully"}), 200
    else:
        return jsonify({"error": "Trip not found"}), 404



# delete trip
@app.route("/trips/<int:trip_id>", methods=["DELETE"])
def delete_trips(trip_id):
    trip = User.query.get(trip_id)

    if trip:
        db.session.delete(trip)
        db.session.commit()
        return jsonify({"success": "Deleted successfully"}), 200
    
    else:
        return jsonify({"error":"Trip you are trying to delete doesn't exist"}), 406
    


# ============================activities========================================
# fetch activities
@app.route("/activities", methods=["GET"])
def fetch_activities():
    activities = Activity.query.all()
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
@app.route("/activities", methods=["POST"])
def add_activities():
    data = request.get_json()
    name = data['name']
    description = data['description']
    scheduled_time_str = data['scheduled_time']  # Assuming input is in HH:MM format
    trip_id = data['trip_id']

    # Validate the time format (HH:MM)
    try:
        scheduled_time = datetime.strptime(scheduled_time_str, '%H:%M').time()
    except ValueError:
        return jsonify({"error": "Invalid time format. Use HH:MM"}), 400

    # Combine the time with the current date (or another date if needed)
    today = datetime.now().date()  # You can replace `today` with a specific date if required
    scheduled_datetime = datetime.combine(today, scheduled_time)

    # Check if activity with this name already exists
    check_name = Activity.query.filter_by(name=name).first()
    
    if check_name:
        return jsonify({"error": "Activity with this name already exists"}), 404
    else:
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
@app.route("/activities/<int:activity_id>", methods=["PUT"])
def update_activities(activity_id):
    activity = Activity.query.get(activity_id)

    if activity:
        data = request.get_json()
        name = data.get('name', activity.name)
        description = data.get('description', activity.description)
        scheduled_time_str = data.get('scheduled_time', activity.scheduled_time)  # Expecting 'HH:MM' format
        trip_id = data.get('trip_id', activity.trip_id)

        # Validate time format (HH:MM)
        try:
            # Ensure it's in HH:MM format
            datetime.strptime(scheduled_time_str, '%H:%M')
        except ValueError:
            return jsonify({"error": "Invalid time format. Use HH:MM"}), 400

        # Check if activity name already exists
        check_name = Activity.query.filter(Activity.name == name, Activity.id != activity.id).first()
        
        if check_name:
            return jsonify({"error": "name already exists"}), 400
        else:
            # Update the activity details
            activity.name = name
            activity.description = description
            activity.scheduled_time = scheduled_time_str  # Store time as string (HH:MM)
            activity.trip_id = trip_id

            db.session.commit()
            return jsonify({"success": "updated successfully"}), 201


# Delete Activities
@app.route("/activities/<int:activity_id>", methods=["DELETE"])
def delete_activities(activity_id):
    activity = Activity.query.get(activity_id)

    if activity:
        db.session.delete(activity)
        db.session.commit()
        return jsonify({"success": "Deleted successfully"}), 200
    
    else:
        return jsonify({"error":"Activity you are trying to delete doesn't exist"}), 406
    




    



    




if __name__ == '__main__':
    app.run(debug=True)