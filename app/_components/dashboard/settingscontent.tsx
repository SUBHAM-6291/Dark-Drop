'use client'
import React, { useState, useEffect } from 'react';
import { apiService } from '@/app/Backend/services/axios';

const SettingsContent: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiService.getUser();
      setUserData({
        username: response.user.username,
        email: response.user.email,
        password: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const updateData = {
        username: userData.username,
        email: userData.email,
        ...(userData.password && { password: userData.password }),
      };

      const response = await apiService.updateUser(updateData);
      setMessage(response.message);
      setIsEditing(false);
      await fetchUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Settings</h2>

        <div className="bg-black border border-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={userData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-black border border-gray-800 rounded-md p-2 text-white disabled:opacity-50 focus:border-white focus:ring-0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-black border border-gray-800 rounded-md p-2 text-white disabled:opacity-50 focus:border-white focus:ring-0"
                required
              />
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-gray-800 rounded-md p-2 text-white focus:border-white focus:ring-0"
                />
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchUserData();
                    }}
                    className="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;