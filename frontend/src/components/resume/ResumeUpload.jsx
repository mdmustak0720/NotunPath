// Purpose:
// Allows users to upload their resume (PDF) using drag & drop or file selection.
// This component only handles the frontend UI and selected file state.
// The backend upload and resume parsing will be implemented in the next step.

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

function ResumeUpload() {

  // Stores the selected resume file so it can be displayed to the user.
  const [file, setFile] = useState(null);

  // Executes after a user drops or selects a file and updates the component state.
  const onDrop = useCallback((acceptedFiles) => {

    // Save the first selected PDF because only one resume is allowed.
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }

  }, []);

  // Configures the drag-and-drop upload area and restricts uploads to PDF files.
  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({

    // Accept only PDF resumes.
    accept: {
      "application/pdf": [".pdf"],
    },

    // Restrict users to uploading a single resume.
    multiple: false,

    // Execute the upload callback after selecting a file.
    onDrop,

  });

  return (

    // Main upload section displayed below the profile card.
    <div className="mt-10 w-full max-w-2xl">

      {/* Interactive drag-and-drop upload area */}
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-cyan-500 bg-[#111827] p-12 text-center transition hover:border-cyan-300"
      >

        {/* Hidden file input managed automatically by React Dropzone */}
        <input {...getInputProps()} />

        {/* Display a different message while the user is dragging a file */}
        {isDragActive ? (

          <p className="text-cyan-300">
            Drop your resume here...
          </p>

        ) : (

          <>
            <p className="text-lg font-semibold text-white">
              Drag & Drop your Resume
            </p>

            <p className="mt-2 text-gray-400">
              or click to browse (PDF only)
            </p>
          </>

        )}
      </div>

      {/* Display selected file information after choosing a resume */}
      {file && (

        <div className="mt-6 rounded-xl bg-[#1F2937] p-4">

          <p className="text-green-400">
            ✅ Selected File
          </p>

          {/* Display the uploaded file name */}
          <p className="mt-2 text-white">
            {file.name}
          </p>

          {/* Display the uploaded file size in KB */}
          <p className="text-sm text-gray-400">
            {(file.size / 1024).toFixed(2)} KB
          </p>

        </div>
      )}
    </div>
  );
}
export default ResumeUpload;