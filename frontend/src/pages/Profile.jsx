import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";  // Import useNavigate for navigation

export default function Profile() {
  const { current_user, updateUser, setCurrentUser, deleteUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: current_user?.username || "",
    email: current_user?.email || "",
    password: "",
  });

  const navigate = useNavigate();  // Initialize navigate function

  if (!current_user) {
    return <h3 className="text-red-500 text-center mt-5">Not Authorized</h3>;
  }

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateUser(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  // Handle delete user
  const handleDelete = () => {
    deleteUser(current_user.id);  // Call deleteUser with current_user.id
    setCurrentUser(null);  // Clear user from context
    navigate("/login");  // Redirect to login page
  };

  return (
    <>
      {
        !current_user ? "Not authorized" :
        <div className="max-w-2xl mx-4 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-16 bg-white shadow-xl rounded-lg text-gray-900">
          <div className="rounded-t-lg h-32 overflow-hidden">
            <img className="object-cover object-top w-full" src='https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt='Mountain'/>
          </div>
          <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
            <img className="object-cover object-center h-32" src='https://i.pinimg.com/474x/76/f3/f3/76f3f3007969fd3b6db21c744e1ef289.jpg' alt='Woman looking front'/>
          </div>
          {/* <div className="text-center mt-2 p-5">
            <h2 className="font-semibold p-2"> Username: {current_user && current_user.username}</h2>
            <p className="text-gray-500">Email: {current_user && current_user.email}</p>
          </div> */}

          {/* Profile Edit Section */}
          <div className="space-y-4 p-4">
            {/* Username */}
            <div className="flex justify-between border-b py-3">
              <h3 className="text-xl font-medium">Username</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-1/2 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="text-gray-600">{current_user.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex justify-between border-b py-3">
              <h3 className="text-xl font-medium">Email</h3>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-1/2 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="text-gray-600">{current_user.email}</p>
              )}
            </div>

            {/* Password */}
            {isEditing && (
              <div className="flex justify-between border-b py-3">
                <h3 className="text-xl font-medium">New Password</h3>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-1/2 px-3 py-2 border rounded-md"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-4 p-4">
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="bg-red-600 px-4 py-2 text-white rounded-lg hover:bg-red-500"
            >
              Delete
            </button>

            {/* Edit/Save Button */}
            {isEditing ? (
              <>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
                  onClick={handleSubmit}
                >
                  Save Changes
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      }
    </>
  );
}
