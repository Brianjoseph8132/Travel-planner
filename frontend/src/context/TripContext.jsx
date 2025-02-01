import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export const TripContext = createContext();

export const TripProvider = ({ children }) => {
    const navigate = useNavigate();
    const { authToken } = useContext(UserContext);

    const [activities, setActivities] = useState([]);
    const [trips, setTrips] = useState([]);
    const [onChange, setOnChange] = useState(true);

    // =================== Activities ===================
    useEffect(() => {
        fetch('https://travel-planner-vlgr.onrender.com/activities', {
            method: "GET",
            headers: {
                'Content-type': 'application/json',
            },
        })
        .then((response) => response.json())
        .then((response) => {
            setActivities(response);
        });
    }, []);



    // ADD 
    const AddActivity = (name, trip_id, description, scheduled_time) => {
        toast.loading("Adding activity...");
    
        // Ensure scheduled_time is in "HH:MM" format
        const formattedTime = scheduled_time && scheduled_time.length === 5 ? scheduled_time : null;
    
        fetch("https://travel-planner-vlgr.onrender.com/activities", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: authToken ? `Bearer ${authToken}` : "",
            },
            body: JSON.stringify({
                trip_id: parseInt(trip_id),  
                name,
                description,
                scheduled_time: formattedTime,  
            })
        })
        .then((resp) => resp.json())
        .then((response) => {
            console.log(response);
    
            if (response.success) {
                toast.dismiss();
                toast.success(response.success);
                if (typeof setOnChange === "function") {
                    setOnChange(prev => !prev);
                }
            } else if (response.error) {
                toast.dismiss();
                toast.error(response.error);
            } else {
                toast.dismiss();
                toast.error("Failed to add");
            }
        })
        .catch((error) => {
            toast.dismiss();
            console.error("Fetch error:", error);
            toast.error("Network error, please try again.");
        });
    };



    
    const updateActivity = (id, name, description, scheduled_time) => {
        
        fetch(`https://travel-planner-vlgr.onrender.com/activities/${id}`, {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                name,
                description,
                scheduled_time,
            }),
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();
            if (response.success) {
                toast.success(response.success);
                setOnChange(!onChange); 
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to update Activity");
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error("Error updating Activity");
            console.error("Update Error:", error);
        });
    };
    













    // DELETE ACTIVITY
    const deleteActivity = (id) => 
        {
            toast.loading("Deleting Activity...");
            fetch(`https://travel-planner-vlgr.onrender.com/activities/${id}`,{
                method: "DELETE",
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            })
            .then((resp) => resp.json())
            .then((response) =>{
                if (response.success){
                    toast.dismiss();
                    toast.success(response.success);
                    setOnChange(!onchange);
                    navigate("/history");
                }else if (response.error) {
                    toast.dismiss();
                    toast.error(response.error);
                }else{
                    toast.dismiss();
                    toast.error("Failed to delete");
                }
            })
        };



    // =========================== Trips ============================
    // Fetch Trips
    useEffect(() => {
        fetch('https://travel-planner-vlgr.onrender.com/trips', {
            method: "GET",
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then((response) => response.json())
        .then((response) => {
            setTrips(response);
        });
    }, [onChange]);



    // Add Trip
    const addTrip = (destination, start_date, end_date, budget) => {
        toast.loading("Adding trip...");
        fetch("https://travel-planner-vlgr.onrender.com/trips", {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                destination, start_date, end_date, budget,
            }),
        })
        .then((resp) => resp.json())
        .then((response) => {
            console.log(response);

            if (response.success) {
                toast.dismiss();
                toast.success(response.success);
                setOnChange(!onChange);
            } else if (response.error) {
                toast.dismiss();
                toast.error(response.error);
            } else {
                toast.dismiss();
                toast.error("Failed to add");
            }
        });
    };



    const updateTrip = (id, destination, start_date, budget, end_date) => {
        
        fetch(`https://travel-planner-vlgr.onrender.com/trips/${id}`, {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                destination,
                start_date,
                budget,
                end_date,
            }),
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();
            if (response.success) {
                toast.success(response.success);
                setOnChange(!onChange); 
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to update Trip");
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error("Error updating Trip");
            console.error("Update Error:", error);
        });
    };
    





// Delete
    const deleteTrip = (id) => {
        toast.loading("Deleting trip...");
        fetch(`https://travel-planner-vlgr.onrender.com/trips/${id}`, {
            method: "DELETE",
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then((resp) => resp.json())
        .then((response) => {
            if (response.success) {
                toast.dismiss();
                toast.success(response.success);
                setOnChange(!onChange);
                navigate("/");
            } else if (response.error) {
                toast.dismiss();
                toast.error(response.error);
            } else {
                toast.dismiss();
                toast.error("Failed to delete");
            }
        });
    };

    const data = {
        activities,
        trips,
        addTrip,
        updateActivity,
        updateTrip,
        deleteActivity,
        deleteTrip,
        AddActivity,
    };

    return (
        <TripContext.Provider value={data}>
            {children}
        </TripContext.Provider>
    );
};
