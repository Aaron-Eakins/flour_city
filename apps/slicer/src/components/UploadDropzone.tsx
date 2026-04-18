'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import styles from './UploadDropzone.module.css';

interface UploadDropzoneProps {
  onFileAccepted: (file: File) => void;
}

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = Math.floor(MAX_FILE_SIZE_MB * 1024 * 1024);
const ALLOWED_EXTENSIONS = ['.stl', '.3mf'];

export default function UploadDropzone({ onFileAccepted }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }

    // Check extension
    const fileName = file.name.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!isExtensionValid) {
      setError('Invalid file type. Please upload an STL or 3MF file.');
      return false;
    }

    return true;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileAccepted(file);
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileAccepted(file);
      }
    }
    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`${styles.dropzone} ${isDragging ? styles.active : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        type="file" 
        className={styles.fileInput} 
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".stl,.3mf"
      />
      
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 16L12 11L17 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11V21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.39 18.39C21.3553 17.8681 22.1154 17.0263 22.5401 16.0094C22.9648 14.9925 23.0298 13.861 22.724 12.8091C22.4182 11.7572 21.76 10.8491 20.8644 10.2396C19.9688 9.63004 18.8906 9.35624 17.81 9.46001H16.74C16.4357 8.2709 15.8285 7.18524 14.9751 6.30419C14.1217 5.42314 13.0537 4.77884 11.8706 4.43169C10.6875 4.08453 9.43265 4.04758 8.22306 4.32431C7.01347 4.60105 5.89504 5.18128 4.97191 6.01103C4.04877 6.84079 3.35515 7.89025 2.9556 9.06173C2.55606 10.2332 2.4654 11.4813 2.69206 12.6896C2.91873 13.8979 3.4542 15.0218 4.24869 15.9566C5.04318 16.8914 6.06646 17.6027 7.22 18.02" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.text}>
          Upload 3D Model <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>– Get Price</span>
        </div>
        <div className={styles.subtext}>
          Drag STL or 3MF here (up to {MAX_FILE_SIZE_MB}MB)
        </div>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
      </div>
      
      {/* Background decoration */}
      <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.15 }}></div>
    </div>
  );
}
