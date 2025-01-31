import React, { useContext } from "react";
import { TripContext } from "../context/TripContext";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router-dom";

export default function History() {
    const { trips, deleteTrip, activities } = useContext(TripContext);
    const { current_user } = useContext(UserContext);

    console.log(trips);

    return (
        <div>
            <h1 className='my-3 text-xl font-bold'>Your Trips - {trips && trips.length}</h1>
            {
                current_user ?
                    <div>
                        {
                            trips && trips.length < 1 &&
                            <div>
                                You don't have Trips
                                <Link to="/addtrip">Create</Link>
                            </div>
                        }
                        <div className='grid grid-cols-2 gap-2'>
                            {
                                trips && trips.map(trip => (
                                    <div className="flex flex-col justify-center h-screen" key={trip.id}>
                                        <div className="relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-lg p-3 max-w-xs md:max-w-3xl mx-auto border border-white bg-white">
                                            <Link to={`/trip/${trip.id}`}className="w-full md:w-1/3 bg-white grid place-items-center">
                                                <img src="https://i.pinimg.com/736x/5f/05/74/5f05742939cf109ffc84f2840399674e.jpg" 
                                                     alt="trip image" className="rounded-xl" />
                                            </Link>
                                            <div className="w-full md:w-2/3 bg-white flex flex-col space-y-2 p-3">
                                                <div className="flex justify-between item-center">
                                                    <button onClick={() => deleteTrip(trip.id)} className='bg-red-600 px-2 py-1 text-white rounded hover:bg-red-400'>Delete</button>
                                                    <div className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800 hidden md:block">{trip.status}</div>
                                                </div>
                                                <h3 className="font-black text-gray-800 md:text-3xl text-xl">{trip.destination}</h3>
                                                <p className="text-gray-500 font-medium hidden md:block">Start: {trip.start_date}</p>
                                                <p className="text-gray-500 font-medium hidden md:block">End: {trip.end_date}</p>
                                                <p className="text-gray-500 font-medium hidden md:block">Budget: ${trip.budget}.0</p>
                                                
                                                {/* Displaying Activities */}
                                                <div>
                                                    <h4 className="font-medium text-gray-700">Activities:</h4>
                                                    {trip.activities && trip.activities.length > 0 ? (
                                                        trip.activities.map(activity => (
                                                            <div key={activity.id} className="p-2 border-t">
                                                                <p className="text-gray-800 font-black">{activity.name}</p>
                                                                <p className="text-gray-500">{activity.description}</p>
                                                                <p className="text-gray-500">{activity.scheduled_time}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p>No activities for this trip</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    :
                    <div className='text-center'>
                        <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
                            <Link to="/login" className="font-medium">Login</Link> to access this page.
                        </div>
                    </div>
            }
        </div>
    );
}
