// src/components/StatusAlerts.jsx
import React from "react";

// Offline alert component
export const OfflineAlert = () => (
  <div className="bg-yellow-600 text-white p-4 rounded-lg m-4 text-center">
    <p className="font-bold">You are currently offline</p>
    <p className="text-sm">Please check your internet connection to continue chatting</p>
  </div>
);

// Trial ended state component
export const TrialEndedState = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-yellow-500 mb-4"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    <h2 className="text-xl font-bold mb-2">Free Trial Ended</h2>
    <p className="text-slate-300 mb-4">
      You've used all your free messages. Upgrade to continue chatting.
    </p>
    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
      Upgrade Now
    </button>
  </div>
);

// Overlay for sidebar on mobile
export const SidebarOverlay = ({ isOpen, onClose }) => (
  <div
    className={`fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity ${
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
    onClick={onClose}
  />
);

// Confirmation Dialog for single conversation deletion
export const DeleteConfirmationDialog = ({ conversationId, onCancel, onDelete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-slate-800 p-6 rounded-lg max-w-sm w-full">
      <h3 className="text-lg font-medium mb-4">Delete Conversation</h3>
      <p className="text-slate-300 mb-6">
        Are you sure you want to delete this conversation? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600"
        >
          Cancel
        </button>
        <button
          onClick={() => onDelete(conversationId)}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);