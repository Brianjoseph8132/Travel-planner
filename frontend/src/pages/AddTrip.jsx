import React, { useContext, useState } from 'react';
import { TripContext } from '../context/TripContext';
import { UserContext } from '../context/UserContext';
import { useNavigate } from "react-router-dom";

export default function AddTrip() {
  const { current_user } = useContext(UserContext);
  const { addTrip } = useContext(TripContext);

  const [destination, setDestination] = useState('');
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('');

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    
      // Step 1: Add the trip
      await addTrip(destination, start_date, end_date, parseFloat(budget), status)

      // Reset form fields
      setDestination('');
      setStartDate('');
      setEndDate('');
      setBudget('');
      setStatus('');
      navigate("/history")

  };

  return (
    <>
      {!current_user ? "Not authorized" : (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add Trip</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Fields */}
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-600">
                Destination
              </label>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-600">
                Start Date
              </label>
              <input
                id="start_date"
                type="date"
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-600">
                End Date
              </label>
              <input
                id="end_date"
                type="date"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-600">
                Budget
              </label>
              <input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="" disabled>Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add Trip 
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
