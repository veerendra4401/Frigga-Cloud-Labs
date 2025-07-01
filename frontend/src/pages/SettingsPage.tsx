import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/settings/Modal';
import { accountService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const SettingsPage: React.FC = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = () => setShowPasswordModal(true);
  const handleNotificationPrefs = () => setShowNotificationModal(true);
  const handleAccountDetails = () => navigate('/account');
  const logout = useAuthStore((state) => state.logout);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteAccount = () => setShowDeleteModal(true);
  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await accountService.deleteAccount();
      logout();
      navigate('/register');
    } catch (err) {
      alert('Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="space-y-6">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
          onClick={handleChangePassword}
        >
          <span className="font-medium text-gray-800">Change Password</span>
          <span className="text-gray-400">&rarr;</span>
        </button>
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
          onClick={handleNotificationPrefs}
        >
          <span className="font-medium text-gray-800">Notification Preferences</span>
          <span className="text-gray-400">&rarr;</span>
        </button>
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
          onClick={handleAccountDetails}
        >
          <span className="font-medium text-gray-800">Account Details</span>
          <span className="text-gray-400">&rarr;</span>
        </button>
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
          onClick={handleDeleteAccount}
        >
          <span className="font-medium text-red-600">Delete Account</span>
          <span className="text-gray-400">&rarr;</span>
        </button>
      </div>

      {/* Change Password Modal */}
      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form className="space-y-4">
          <input type="password" placeholder="Current Password" className="w-full border rounded px-3 py-2" />
          <input type="password" placeholder="New Password" className="w-full border rounded px-3 py-2" />
          <input type="password" placeholder="Confirm New Password" className="w-full border rounded px-3 py-2" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">Update Password</button>
        </form>
      </Modal>

      {/* Notification Preferences Modal */}
      <Modal open={showNotificationModal} onClose={() => setShowNotificationModal(false)} title="Notification Preferences">
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox" /> Email Notifications
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox" /> Push Notifications
          </label>
        </div>
        <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition" onClick={() => setShowNotificationModal(false)}>Save</button>
      </Modal>

      {/* Delete Account Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <p className="mb-4 text-red-600">Are you sure you want to delete your account? This action cannot be undone.</p>
        <button
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition mb-2 disabled:opacity-60"
          onClick={confirmDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </button>
        <button className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</button>
      </Modal>
    </div>
  );
};

export default SettingsPage;
