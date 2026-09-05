/**
 * Resume Service
 *
 * Purpose:
 * Handles all frontend API communication related
 * to resume processing, retrieval, and version history.
 */

import axios from "axios";

// =========================================================
// API Configuration
// =========================================================

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

// Create a shared Axios instance for all resume calls.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

// =========================================================
// Helpers
// =========================================================

const getAuthConfig = (token) => {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// =========================================================
// Upload Resume
// =========================================================

export const uploadResume = async (file, token) => {
  if (!file) {
    throw new Error("Please select a resume.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/resume/upload",
    formData,
    getAuthConfig(token),
  );

  return response.data;
};

// =========================================================
// Get Latest Resume
// =========================================================

export const getLatestResume = async (token) => {
  const response = await api.get(
    "/resume/latest",
    getAuthConfig(token),
  );

  return response.data;
};

// =========================================================
// Get Resume History
// =========================================================

export const getResumeHistory = async (token) => {
  const response = await api.get(
    "/resume/history",
    getAuthConfig(token),
  );

  return response.data;
};

// =========================================================
// Get All Resume Versions
// =========================================================

export const getAllResumes = async (token) => {
  const response = await api.get(
    "/resume",
    getAuthConfig(token),
  );

  return response.data;
};