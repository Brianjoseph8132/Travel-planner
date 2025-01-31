import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { TripContext } from "../context/TripContext";

export default function History() {
    const { id } = useParams();
    const { trips, deleteTrip, updateTrip, deleteActivity, updateActivity } = useContext(TripContext);
    const [showForm, setShowForm] = useState(false);
    const [updatedTrip, setUpdatedTrip] = useState({});
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [updatedActivity, setUpdatedActivity] = useState({});
    
    const trip = trips && trips.find((trip) => trip.id == id);

    const handleEdit = () => {
        setUpdatedTrip({
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            budget: trip.budget
        });
        setShowForm(true); // Toggle the form visibility
    };

    const handleSaveChanges = () => {
        if (updatedTrip.destination && updatedTrip.start_date && updatedTrip.end_date && updatedTrip.budget) {
            updateTrip(trip.id, updatedTrip.destination, updatedTrip.start_date, updatedTrip.budget, updatedTrip.end_date);
            setShowForm(false); // Hide the form after saving
        } else {
            toast.error("Please fill in all required fields.");
        }
    };

    const handleCancel = () => {
        setShowForm(false); // Hide the form without making any changes
    };

    const handleDeleteActivity = (e, activityId) => {
        e.preventDefault(); // Prevents the default behavior (such as page reload or form submission)
    
        // Call the deleteActivity function to remove the activity
        deleteActivity(activityId, trip.id); // Assuming this function updates the trip's activities in the context
    };

    const handleEditActivity = (activity) => {
        setUpdatedActivity({
            id: activity.id,
            name: activity.name,
            description: activity.description,
            scheduled_time: activity.scheduled_time
        });
        setShowActivityForm(true); // Toggle the activity form visibility
    };

    const handleSaveActivityChanges = () => {
        if (updatedActivity.name && updatedActivity.description && updatedActivity.scheduled_time) {
            // Ensure you're passing the correct activity ID
            updateActivity(updatedActivity.id, updatedActivity.name, updatedActivity.description, updatedActivity.scheduled_time);
            setShowActivityForm(false); // Hide the form after saving
        } else {
            toast.error("Please fill in all required fields.");
        }
    };

    const handleCancelActivity = () => {
        setShowActivityForm(false); // Hide the activity form without making any changes
    };

    return (
        <div>
            {!trip ? (
                "Trip not found"
            ) : (
                <div className="border border-blue-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        {/* Edit Button */}
                        <span
                            onClick={handleEdit}
                            className="bg-green-600 px-3 py-1 text-white rounded-lg hover:cursor-pointer hover:bg-green-400 ml-auto"
                        >
                            Edit
                        </span>
                        {/* Delete Button */}
                        <span
                            onClick={() => deleteTrip(trip.id)}
                            className="bg-red-600 px-3 py-1 text-white rounded-lg hover:cursor-pointer hover:bg-red-400 ml-3"
                        >
                            Delete
                        </span>
                        {/* Status */}
                        <div className="bg-blue-600 px-3 py-1 rounded-full text-xs font-medium text-white ml-3">
                            {trip.status}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row">
                        {/* Trip Image on the Left */}
                        <div className="w-full md:w-1/3 grid justify-center mb-4 md:mb-0">
                            <img
                                src="https://i.pinimg.com/736x/5f/05/74/5f05742939cf109ffc84f2840399674e.jpg"
                                alt="Trip Image"
                                className="rounded-xl w-2/3 object-cover"
                            />
                        </div>

                        {/* Trip Details on the Right */}
                        <div className="w-full md:w-2/3 flex flex-col space-y-2 p-3">
                            <h1 className="font-semibold">{trip.destination}</h1>
                            <p>{trip.description}</p>

                            <div className="mt-3">
                                <p className="text-gray-500 font-medium">Start Date: {trip.start_date}</p>
                                <p className="text-gray-500 font-medium">End Date: {trip.end_date}</p>
                                <p className="text-gray-500 font-medium">Budget: ${trip.budget}.0</p>
                            </div>

                            {/* Displaying Activities */}
                            <div className="mt-3">
                                <h4 className="font-medium text-gray-700">Activities:</h4>
                                {trip.activities && trip.activities.length > 0 ? (
                                    trip.activities.map((activity) => (
                                        <div key={activity.id} className="p-2 border-t">
                                            <p className="text-gray-800 font-black">{activity.name}</p>
                                            <p className="text-gray-500">{activity.description}</p>
                                            <p className="text-gray-500">{activity.scheduled_time}</p>
                                            
                                            {/* Edit and Delete Buttons for Activity */}
                                            <button
                                                onClick={() => handleEditActivity(activity)}  // Edit activity
                                                className="bg-yellow-600 text-white px-2 py-1 rounded mt-2 hover:bg-yellow-400"
                                            >
                                                Edit Activity
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteActivity(e, activity.id)}  // Delete activity
                                                className="bg-red-600 text-white px-2 py-1 rounded mt-2 hover:bg-red-400 ml-3"
                                            >
                                                Delete Activity
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No activities for this trip</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pop-up Form for Editing Trip */}
            {showForm && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-1/3">
                        <h2 className="text-xl font-semibold mb-4">Edit Trip</h2>
                        <form>
                            <div className="mb-3">
                                <label className="block text-gray-700">Destination</label>
                                <input
                                    type="text"
                                    value={updatedTrip.destination}
                                    onChange={(e) => setUpdatedTrip({ ...updatedTrip, destination: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    value={updatedTrip.start_date}
                                    onChange={(e) => setUpdatedTrip({ ...updatedTrip, start_date: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    value={updatedTrip.end_date}
                                    onChange={(e) => setUpdatedTrip({ ...updatedTrip, end_date: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700">Budget</label>
                                <input
                                    type="number"
                                    value={updatedTrip.budget}
                                    onChange={(e) => setUpdatedTrip({ ...updatedTrip, budget: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleSaveChanges}
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pop-up Form for Editing Activity */}
            {showActivityForm && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-1/3">
                        <h2 className="text-xl font-semibold mb-4">Edit Activity</h2>
                        <form>
                            <div className="mb-3">
                                <label className="block text-gray-700">Activity Name</label>
                                <input
                                    type="text"
                                    value={updatedActivity.name}
                                    onChange={(e) => setUpdatedActivity({ ...updatedActivity, name: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700">Description</label>
                                <input
                                    type="text"
                                    value={updatedActivity.description}
                                    onChange={(e) => setUpdatedActivity({ ...updatedActivity, description: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700">Scheduled Time</label>
                                <input
                                    type="text"
                                    value={updatedActivity.scheduled_time}
                                    onChange={(e) => setUpdatedActivity({ ...updatedActivity, scheduled_time: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleSaveActivityChanges}
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelActivity}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
