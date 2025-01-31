import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState(() =>
    sessionStorage.getItem("token")
  );
  const [current_user, setCurrentUser] = useState(null);
  const [onChange, setOnChange] = useState(true);

  console.log("Current user ", current_user);

  // LOGIN
  const login = (email, password) => {
    toast.loading("Logging you in ...");
    fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((resp) => resp.json())
      .then((response) => {
        if (response.access_token) {
          toast.dismiss();

          sessionStorage.setItem("token", response.access_token);

          setAuthToken(response.access_token);

          fetch("http://127.0.0.1:5000/current_user", {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${response.access_token}`,
            },
          })
            .then((resp) => resp.json())
            .then((resp) => {
              if (resp.email) {
                setCurrentUser(resp);
              }
            });

          toast.success("Successfully Logged in");
          navigate("/");
        } else if (response.error) {
          toast.dismiss();
          toast.error(response.error);
        } else {
          toast.dismiss();
          toast.error("Failed to login");
        }
      });
  };

  // const logout =  () => {
  //   sessionStorage.removeItem("token");
  //   setAuthToken(null);
  //   setCurrentUser(null);
  // };

  const logout = () => {

    toast.loading("Logging you out ... ");
    fetch("http://127.0.0.1:5000/logout", {
      method: "DELETE",
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    })
      .then((resp) => resp.json())
      .then((response) => {
        
        if (response.success)

        {
        sessionStorage.removeItem("token");
        setAuthToken(null);
        setCurrentUser(null);

        toast.dismiss();
        toast.success("Successfully logged out")

        navigate("/login")
        }

      })
    }




  // Fetch current user
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = () => {
    console.log("Current user fcn", authToken);

    fetch("http://127.0.0.1:5000/current_user", {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.email) {
          setCurrentUser(response);
        }
      });
  };

  // ADD User
  const addUser = (username, email, password) => {
    toast.loading("Signing up ...");
    fetch("http://127.0.0.1:5000/users", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    })
      .then((resp) => resp.json())
      .then((response) => {
        console.log(response);

        if (response.success) {
          toast.dismiss();
          toast.success(response.success);
          navigate("/login");
        } else if (response.error) {
          toast.dismiss();
          toast.error(response.error);
        } else {
          toast.dismiss();
          toast.error("Failed to add");
        }
      });
  };

  // UPDATE User
    // Function to update user (placeholder)
    const updateUser = async (updatedData) => {
      if (!authToken) return false;
    
      try {
        const response = await fetch("http://127.0.0.1:5000/update_profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedData),
        });
    
        const data = await response.json();
        if (response.ok) {
          setCurrentUser((prevUser) => ({ ...prevUser, ...updatedData }));
          toast.success("Profile updated successfully!");
          return true;
        } else {
          toast.error(data.error || "Failed to update profile");
          return false;
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("An error occurred while updating");
        return false;
      }
    };


// Delete User
  const deleteUser = (userId) => {
  toast.loading("Deleting User...");
  
  fetch(`http://127.0.0.1:5000/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  })
    .then((resp) => resp.json())
    .then((response) => {
      if (response.success) {
        toast.dismiss();
        toast.success(response.success); // Success message
        setOnChange(!onChange);
        
        // Log out the user by clearing the auth token
        sessionStorage.removeItem("token"); // Clear token from sessionStorage
        setAuthToken(null);
        setCurrentUser(null);
         
        // Redirect to login page
        navigate("/login");
      } else if (response.error) {
        toast.dismiss();
        toast.error(response.error); // Error message
      } else {
        toast.dismiss();
        toast.error("Failed to delete user");
      }
    })
    .catch((err) => {
      toast.dismiss();
      toast.error("Error deleting user"); // Error handling in case of request failure
      console.error("Error deleting user:", err);
    });
  };

  
  

  const data = {
    authToken,
    login,
    current_user,
    logout,
    addUser,
    updateUser,
    deleteUser,
  };

  return (
    <UserContext.Provider value={data}>
      {children}
    </UserContext.Provider>
  );
};
