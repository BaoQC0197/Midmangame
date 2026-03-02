// src/components/ImageUpload.tsx
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { uploadImage } from '../api/products';

interface ImageUploadProps {
    currentImageUrl?: string;
    onUploaded: (url: string) => void;
}

export default function ImageUpload({ currentImageUrl, onUploaded }: ImageUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Chỉ chấp nhận file ảnh (jpg, png, webp...)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Ảnh không được vượt quá 5MB');
            return;
        }

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setError('');
        setUploading(true);

        try {
            const publicUrl = await uploadImage(file);
            onUploaded(publicUrl);
        } catch (err) {
            setError('Upload thất bại. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    return (
        <div className="image-upload-wrapper">
            <div
                className={`image-drop-zone${dragging ? ' dragging' : ''}${previewUrl ? ' has-image' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="preview" className="image-preview" />
                        {uploading && (
                            <div className="upload-overlay">
                                <span>Đang upload...</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="upload-placeholder">
                        <span className="upload-icon">🖼️</span>
                        <p>Kéo ảnh vào đây hoặc <strong>bấm để chọn</strong></p>
                        <small>JPG, PNG, WEBP — tối đa 5MB</small>
                    </div>
                )}
            </div>

            {error && <p className="upload-error">{error}</p>}

            {previewUrl && !uploading && (
                <button
                    type="button"
                    className="upload-change-btn"
                    onClick={() => inputRef.current?.click()}
                >
                    Đổi ảnh khác
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
}
