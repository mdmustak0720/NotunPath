/**
 * Resume Service
 *
 * Purpose:
 * Handles all frontend API communication related
 * to resume processing.
 */

import axios from "axios";

// ---------------------------------------------------------
// API Configuration
// ---------------------------------------------------------

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

// ---------------------------------------------------------
// Upload Resume
// ---------------------------------------------------------

export const uploadResume = async (
  file,
  token,
) => {

  // Create multipart form data.
  const formData = new FormData();

  formData.append(
    "file",
    file,
  );

  // Send the resume to the backend.
  const response = await axios.post(
    `${API_BASE_URL}/resume/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};


// ---------------------------------------------------------
// Get Latest Resume
// ---------------------------------------------------------

export const getLatestResume = async (
  token,
) => {

  // Request the latest resume for the authenticated user.
  const response = await axios.get(
    `${API_BASE_URL}/resume/latest`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};