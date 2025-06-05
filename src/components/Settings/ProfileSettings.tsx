import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { signOutUser } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

interface Profile {
  fullName: string;
}

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    // Handle profile update
    try {
      await axios.post(
        `${URL}/api/user/update-profil/${currentUser?.id}`,
        profile,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setUpdateLoading(false);
    }
  };
  const fetchUserProfile = async () => {
    // Handle profile update
    try {
      const response = await axios.get(
        `${URL}/api/user/fetch-profile/${currentUser?.id}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setProfile({
        fullName: response.data.fullName,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, []);
  const handleDeleteAccount = async () => {
    // Handle account deletion
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      await axios.delete(
        `${URL}/api/user/delete-user-permanently/${currentUser.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      dispatch(signOutUser());
      toast.success("Account deleted successfully");
      navigate("/signup");
    }
  };

  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-8 h-[70vh]">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              Personal Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile?.fullName}
                  onChange={(e) =>
                    setProfile({ ...profile, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser?.email}
                  disabled
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                />
                <p className="mt-1 text-sm text-slate-500">
                  Email cannot be changed
                </p>
              </div>

              <button
                type="submit"
                disabled={updateLoading}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                {updateLoading ? (
                  <>
                    <div className="flex justify-center items-center gap-2">
                      <p>Updating...</p>
                      <ClipLoader size={14} color="white" />
                    </div>
                  </>
                ) : (
                  <p>Update Profile</p>
                )}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              Danger Zone
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Permanently delete your account and all associated data, including
              all employee accounts. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              Delete Account
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSettings;
