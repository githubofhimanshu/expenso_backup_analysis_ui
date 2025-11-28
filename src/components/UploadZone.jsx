import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadFile } from '../services/api';

const UploadZone = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setError(null);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            await processFile(files[0]);
        }
    }, []);

    const handleFileInput = async (e) => {
        if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
        }
    };

    const processFile = async (file) => {
        if (!file.name.endsWith('.zip')) {
            setError('Please upload a ZIP file.');
            return;
        }

        setIsUploading(true);
        try {
            await uploadFile(file);
            onUploadSuccess();
        } catch (err) {
            setError('Upload failed. Please try again.');
            console.error(err);
        } finally {
            setIsUploading(false);
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
                onClick={() => document.getElementById('fileInput').click()}
            >
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
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
                <div style={{ marginTop: '1rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
