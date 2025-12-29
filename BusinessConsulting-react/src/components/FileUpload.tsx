import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
// ✅ תיקון: ייבוא ללא סוגריים מסולסלים
import api from '../services/api'; 
import { useToast } from './ToastProvider';

interface RootState {
    auth: {
        user: {
            id: string;
            role: string;
        } | null;
    };
}

const FileUpload: React.FC = () => {
    // State
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadType, setUploadType] = useState<'profile' | 'document'>('profile');
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
    
    // Hooks
    const inputRef = useRef<HTMLInputElement>(null);
    const { showSuccess, showError } = useToast();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user } = useSelector((state: RootState) => state.auth);

    // --- Drag & Drop Handlers ---
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    // --- Validation ---
    const validateAndSetFile = (selectedFile: File) => {
        setUploadedFileUrl(''); // איפוס תצוגה קודמת

        // בדיקת סוג קובץ
        if (uploadType === 'profile' && !selectedFile.type.startsWith('image/')) {
            showError('שגיאה', 'עבור תמונת פרופיל יש להעלות קובץ תמונה בלבד');
            return;
        }

        // בדיקת גודל (5MB / 10MB)
        const maxSize = uploadType === 'profile' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            showError('שגיאה', `הקובץ גדול מדי (מקסימום ${uploadType === 'profile' ? '5MB' : '10MB'})`);
            return;
        }

        setFile(selectedFile);
    };

    // --- Upload Logic ---
    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        
        if (uploadType === 'profile') {
            formData.append('profileImage', file);
        } else {
            formData.append('document', file);
        }

        try {
            const endpoint = uploadType === 'profile' 
                ? '/uploads/profile-image' 
                : '/uploads/document';

            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                showSuccess('הצלחה', `${uploadType === 'profile' ? 'תמונת פרופיל' : 'מסמך'} הועלה בהצלחה!`);
                
                // טיפול בנתיב התמונה שחזר מהשרת
                const fileUrl = response.data.file?.url || response.data.url;
                const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:3000${fileUrl}`;
                
                setUploadedFileUrl(fullUrl);
                setFile(null); 
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'העלאת הקובץ נכשלה';
            showError('שגיאה', msg);
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* כפתורי בחירה (Toggle) */}
            <div className="flex justify-center space-x-4 mb-6 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
                <button
                    onClick={() => { setUploadType('profile'); setFile(null); setUploadedFileUrl(''); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        uploadType === 'profile' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    תמונת פרופיל
                </button>
                <button
                    onClick={() => { setUploadType('document'); setFile(null); setUploadedFileUrl(''); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        uploadType === 'document' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    מסמך
                </button>
            </div>

            {/* איזור הגרירה והשחרור */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer ${
                    dragActive 
                        ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                        : file 
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()} // לחיצה על הריבוע פותחת את החלון
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept={uploadType === 'profile' ? "image/*" : "image/*,.pdf,.doc,.docx"}
                />

                {!file ? (
                    <div className="space-y-4 pointer-events-none">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            {uploadType === 'profile' ? <ImageIcon className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                        </div>
                        <div>
                            <p className="text-xl font-medium text-gray-700">
                                לחץ לבחירה או גרור קובץ לכאן
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                {uploadType === 'profile' ? 'JPG, PNG (עד 5MB)' : 'PDF, DOCX, תמונות (עד 10MB)'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 cursor-default" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-w-sm mx-auto">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                {file.type.includes('image') ? (
                                    <ImageIcon className="h-6 w-6 text-purple-600" />
                                ) : (
                                    <FileText className="h-6 w-6 text-blue-600" />
                                )}
                            </div>
                            <div className="text-right flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className={`w-full max-w-sm mx-auto flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium transition-all ${
                                uploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                                    מעלה...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 ml-2" />
                                    אשר והעלה קובץ
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* תצוגה מקדימה לאחר ההעלאה */}
            {uploadedFileUrl && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 animate-fade-in">
                    <div className="flex items-center space-x-4">
                        {uploadType === 'profile' ? (
                            <img 
                                src={uploadedFileUrl} 
                                alt="Profile New" 
                                className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-8 w-8 text-green-600" />
                            </div>
                        )}
                        <div>
                            <h4 className="font-medium text-green-900">ההעלאה הושלמה!</h4>
                            <a 
                                href={uploadedFileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-green-700 hover:underline flex items-center mt-1"
                            >
                                צפה בקובץ
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;