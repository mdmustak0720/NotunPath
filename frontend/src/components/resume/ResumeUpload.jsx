/**
 * Resume Upload
 *
 * Purpose:
 * Production-ready resume upload experience
 * with drag-and-drop, upload progress states,
 * polished micro-interactions, and clear feedback.
 */

import {
  useCallback,
  useState,
} from "react";

import {
  useDropzone,
} from "react-dropzone";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import {
  AlertCircle,
  Check,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

import useAuthStore from "../../store/authStore";

import {
  uploadResume,
} from "../../services/resumeService";


function ResumeUpload({
  onUploadSuccess,
}) {

  // -------------------------------------------------------
  // Authentication
  // -------------------------------------------------------

  const {
    token,
  } = useAuthStore();


  // -------------------------------------------------------
  // Accessibility / Motion
  // -------------------------------------------------------

  const prefersReducedMotion = useReducedMotion();


  // -------------------------------------------------------
  // Local UI State
  // -------------------------------------------------------

  const [
    file,
    setFile,
  ] = useState(null);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    uploadError,
    setUploadError,
  ] = useState(null);

  const [
    uploadSuccess,
    setUploadSuccess,
  ] = useState(false);


  // -------------------------------------------------------
  // File Selection
  // -------------------------------------------------------

  const onDrop = useCallback(
    (acceptedFiles) => {

      setUploadError(null);
      setUploadSuccess(false);

      if (acceptedFiles.length === 0) {
        return;
      }

      setFile(
        acceptedFiles[0],
      );
    },
    [],
  );


  // -------------------------------------------------------
  // Dropzone Configuration
  // -------------------------------------------------------

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({

    accept: {
      "application/pdf": [
        ".pdf",
      ],
    },

    multiple: false,

    maxFiles: 1,

    onDrop,

    disabled: isUploading,

  });


  // -------------------------------------------------------
  // Upload Resume
  // -------------------------------------------------------

  const handleUpload = async () => {

    if (!file) {

      setUploadError(
        "Please select a PDF resume first.",
      );

      return;
    }


    if (!token) {

      setUploadError(
        "Your session has expired. Please log in again.",
      );

      return;
    }


    try {

      setIsUploading(true);

      setUploadError(null);

      setUploadSuccess(false);


      const result = await uploadResume(
        file,
        token,
      );


      setUploadSuccess(true);


      if (onUploadSuccess) {

        onUploadSuccess(result);

      }

    } catch (error) {

      console.error(
        "Resume upload failed:",
        error,
      );


      const message =
        error.response?.data?.detail ||
        "Resume upload failed. Please try again.";


      setUploadError(
        message,
      );

    } finally {

      setIsUploading(false);

    }

  };


  // -------------------------------------------------------
  // Remove Selected File
  // -------------------------------------------------------

  const handleRemoveFile = () => {

    if (isUploading) {
      return;
    }

    setFile(null);

    setUploadError(null);

    setUploadSuccess(false);

  };


  // -------------------------------------------------------
  // Format File Size
  // -------------------------------------------------------

  const formatFileSize = (
    bytes,
  ) => {

    if (bytes < 1024) {

      return `${bytes} B`;

    }


    if (bytes < 1024 * 1024) {

      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;

    }


    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;

  };


  // -------------------------------------------------------
  // Animation Helpers
  // -------------------------------------------------------

  const entranceAnimation = prefersReducedMotion
    ? {}
    : {
        initial: {
          opacity: 0,
          y: 12,
        },

        animate: {
          opacity: 1,
          y: 0,
        },

        transition: {
          duration: 0.35,
          ease: "easeOut",
        },
      };


  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------

  return (

    <div className="w-full max-w-3xl">


      {/* ---------------------------------------------------
          Upload Zone
      --------------------------------------------------- */}

      <motion.div
        {...entranceAnimation}
        {...getRootProps()}
        whileHover={
          !isUploading && !prefersReducedMotion
            ? {
                scale: 1.005,
              }
            : undefined
        }
        className={`
          group
          relative
          cursor-pointer
          overflow-hidden
          rounded-3xl
          border
          p-8
          sm:p-10
          text-center
          transition-all
          duration-300

          ${
            isDragActive
              ? `
                border-cyan-300
                bg-cyan-400/[0.08]
                shadow-[0_0_60px_rgba(34,211,238,0.14)]
              `
              : isDragReject
                ? `
                  border-red-400/50
                  bg-red-400/[0.05]
                `
                : `
                  border-white/10
                  bg-white/[0.025]
                  hover:border-cyan-400/40
                  hover:bg-white/[0.045]
                `
          }

          ${
            isUploading
              ? "cursor-not-allowed opacity-80"
              : ""
          }
        `}
      >

        <input
          {...getInputProps()}
        />


        {/* Ambient Glow */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            h-40
            w-40
            -translate-x-1/2
            rounded-full
            bg-cyan-400/10
            blur-3xl
          "
        />


        {/* Secondary Glow */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            h-24
            w-56
            -translate-x-1/2
            rounded-full
            bg-blue-500/[0.04]
            blur-3xl
          "
        />


        {/* Icon */}

        <motion.div
          animate={
            isUploading && !prefersReducedMotion
              ? {
                  scale: [1, 1.05, 1],
                }
              : undefined
          }
          transition={
            isUploading
              ? {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }
              : undefined
          }
          className="
            relative
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            border
            border-cyan-400/20
            bg-cyan-400/[0.08]
            text-cyan-300
            shadow-[0_0_30px_rgba(34,211,238,0.08)]
          "
        >

          {isUploading ? (

            <Loader2
              className="h-7 w-7 animate-spin"
            />

          ) : isDragActive ? (

            <UploadCloud
              className="h-7 w-7"
            />

          ) : (

            <FileText
              className="h-7 w-7"
            />

          )}

        </motion.div>


        {/* Heading */}

        <h3
          className="
            relative
            mt-6
            text-xl
            font-semibold
            tracking-tight
            text-white
          "
        >

          {isUploading

            ? "Analyzing your resume..."

            : isDragReject

              ? "This file isn't supported"

              : isDragActive

                ? "Drop your resume here"

                : "Upload your resume"

          }

        </h3>


        {/* Description */}

        <p
          className="
            relative
            mx-auto
            mt-2
            max-w-md
            text-sm
            leading-6
            text-gray-400
          "
        >

          {isUploading

            ? "Our AI is extracting your career information and building your personalized profile."

            : isDragReject

              ? "Please upload a PDF file."

              : "Drag & drop your PDF here, or click anywhere to browse your files."

          }

        </p>


        {/* File Information */}

        {!isUploading && (

          <div
            className="
              relative
              mt-5
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-gray-500
            "
          >

            <span>
              PDF only
            </span>

            <span>
              •
            </span>

            <span>
              One resume
            </span>

            <span>
              •
            </span>

            <span>
              Secure processing
            </span>

          </div>

        )}

      </motion.div>


      {/* ---------------------------------------------------
          Selected File
      --------------------------------------------------- */}

      <AnimatePresence
        initial={!prefersReducedMotion}
      >

        {file && (

          <motion.div
            initial={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 0,
                    y: 10,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 0,
                    y: -8,
                  }
            }
            transition={{
              duration: 0.25,
            }}
            className="
              mt-5
              rounded-2xl
              border
              border-white/10
              bg-white/[0.025]
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

              {/* File */}

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-red-400/10
                    bg-red-400/[0.08]
                    text-red-300
                  "
                >

                  <FileText
                    className="h-5 w-5"
                  />

                </div>


                <div
                  className="min-w-0"
                >

                  <p
                    className="
                      truncate
                      font-medium
                      text-white
                    "
                  >
                    {file.name}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                    "
                  >
                    {formatFileSize(file.size)}
                  </p>

                </div>

              </div>


              {/* Remove */}

              {!isUploading && !uploadSuccess && (

                <motion.button
                  type="button"
                  onClick={handleRemoveFile}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 1.04,
                        }
                  }
                  whileTap={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 0.96,
                        }
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    text-gray-500
                    transition
                    hover:bg-white/5
                    hover:text-red-300
                  "
                >

                  <Trash2
                    className="h-4 w-4"
                  />

                  Remove

                </motion.button>

              )}

            </div>


            {/* Upload Button */}

            {!uploadSuccess && (

              <motion.button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                whileHover={
                  !isUploading && !prefersReducedMotion
                    ? {
                        scale: 1.01,
                      }
                    : undefined
                }
                whileTap={
                  !isUploading && !prefersReducedMotion
                    ? {
                        scale: 0.985,
                      }
                    : undefined
                }
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-cyan-400
                  px-5
                  py-3
                  font-semibold
                  text-black
                  shadow-[0_8px_30px_rgba(34,211,238,0.12)]
                  transition
                  hover:bg-cyan-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {isUploading ? (

                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                    />

                    AI is analyzing...

                  </>

                ) : (

                  <>
                    <Sparkles
                      className="h-4 w-4"
                    />

                    Analyze Resume

                  </>

                )}

              </motion.button>

            )}

          </motion.div>

        )}

      </AnimatePresence>


      {/* ---------------------------------------------------
          Success
      --------------------------------------------------- */}

      <AnimatePresence>

        {uploadSuccess && (

          <motion.div
            initial={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 0,
                    y: 10,
                    scale: 0.98,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.3,
            }}
            className="
              mt-5
              rounded-2xl
              border
              border-emerald-400/20
              bg-emerald-400/[0.05]
              p-5
              shadow-[0_0_40px_rgba(52,211,153,0.05)]
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-400/10
                  text-emerald-300
                "
              >

                <Check
                  className="h-5 w-5"
                />

              </div>


              <div>

                <p
                  className="
                    font-medium
                    text-emerald-300
                  "
                >
                  Resume analyzed successfully
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Your AI career profile is ready.
                </p>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* ---------------------------------------------------
          Error
      --------------------------------------------------- */}

      <AnimatePresence>

        {uploadError && (

          <motion.div
            initial={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 0,
                    y: 8,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 0,
                    y: -8,
                  }
            }
            className="
              mt-5
              rounded-2xl
              border
              border-red-400/20
              bg-red-400/[0.05]
              p-5
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-red-400/10
                  text-red-300
                "
              >

                <AlertCircle
                  className="h-5 w-5"
                />

              </div>


              <div>

                <p
                  className="
                    font-medium
                    text-red-300
                  "
                >
                  Resume upload failed
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-red-200/60
                  "
                >
                  {uploadError}
                </p>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

}

export default ResumeUpload;