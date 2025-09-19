import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB'][i];
};

export function ModernUploader({ file, progress, isUploading, onFileSelect, onFileRemove, setUploadError }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onFileRemove();
  };

  return (
    <div
      className="modern-uploader"
      onClick={() => !file && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={!!file}
      />
      <AnimatePresence>
        {!file ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="uploader-content"
          >
            <svg className="uploader-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p>
                <span className="uploader-text-main">Drag & drop files here</span>
                , or click to browse
            </p>
            <p className="uploader-text-secondary">
                Supports: 1 PDF (Max 10MB)
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="file-preview-container-integrated"
          >
            {!isUploading && (
              <button onClick={handleRemoveClick} className="remove-file-button">
                &times;
              </button>
            )}
            <div className="file-info">
              <span className="file-info-icon">📄</span>
              <div className="file-info-text">
                <p className="name">{file.name}</p>
                <p className="size">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <p className="upload-status">
              {isUploading ? 'Uploading...' : 'Upload Complete!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}