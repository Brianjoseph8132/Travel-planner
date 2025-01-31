import React, { useContext, useState } from 'react';
import { TripContext } from '../context/TripContext';
import { UserContext } from '../context/UserContext';
import { useNavigate } from "react-router-dom";

export default function AddActivity() {
  const { current_user } = useContext(UserContext);
  const { AddActivity, trips } = useContext(TripContext);

  const [name, setName] = useState('');
  const [trip_id, setTripId] = useState('');
  const [description, setDescription] = useState('');
  const [scheduled_time, setScheduled_Time] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure that all required fields are provided
    if (!name || !trip_id || !description || !scheduled_time) {
      alert("All fields are required.");
      return;
    }

    // Step 1: Add the activity
    await AddActivity(name, parseInt(trip_id, 10), description, scheduled_time);

    // Reset form fields
    setName('');
    setTripId('');
    setDescription('');
    setScheduled_Time('');
    navigate("/history");
  };

  return (
    <>
      {!current_user ? "Not authorized" : (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add Activity</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="trip" className="block text-sm font-medium text-gray-600">
                Trip
              </label>
              <select 
                id="trip"
                onChange={(e) => setTripId(e.target.value)} 
                value={trip_id}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                required
              >
                <option value="">Select</option>
                {trips && trips.map((trip) => (
                  <option value={trip.id} key={trip.id}>{trip.destination}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-600">
                Scheduled Time
              </label>
              <input
                id="scheduled_time"
                type="time"
                value={scheduled_time}
                onChange={(e) => setScheduled_Time(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add Activity
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}