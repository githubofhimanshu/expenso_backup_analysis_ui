import React, { useCallback, useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

const UploadZone = ({ onUploadSuccess = () => {}, onUploadError = () => {} }) => {
    const { loadDataFromZip } = useData();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const processFile = useCallback(async (file) => {
        if (!file.name.endsWith('.zip')) {
            const message = 'Please upload a ZIP file.';
            setError(message);
            onUploadError(message);
            return;
        }

        setIsUploading(true);
        setError(null);
        
        try {
            const result = await loadDataFromZip(file);
            
            if (result.success) {
                onUploadSuccess();
            } else {
                const message = result.error || 'Failed to process file. Please try again.';
                setError(message);
                onUploadError(message);
            }
        } catch (err) {
            const message = 'Failed to process file. Please ensure it\'s a valid backup ZIP.';
            setError(message);
            onUploadError(message);
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    }, [loadDataFromZip, onUploadError, onUploadSuccess]);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setError(null);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            await processFile(files[0]);
        }
    }, [processFile]);

    const handleFileInput = async (e) => {
        if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
        }
    };

    return (
        <div className="card">
            <div
                className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept=".zip"
                />

                {isUploading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <>
                        <Upload size={48} className="text-secondary" style={{ marginBottom: '1rem' }} />
                        <h3>Drop your backup ZIP here</h3>
                        <p className="text-secondary">or click to browse</p>
                    </>
                )}
            </div>

            {error && (
                <div className="inline-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
