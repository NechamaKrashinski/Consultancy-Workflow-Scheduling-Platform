import { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

interface RootState {
    auth: {
        user: {
            id: string;
            role: string;
        } | null;
    };
}

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState<'profile' | 'document'>('profile');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState<string>('');
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');

    const { user } = useSelector((state: RootState) => state.auth);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        setUploadStatus('idle');
        setUploadMessage('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadMessage('אנא בחר קובץ להעלאה');
            setUploadStatus('error');
            return;
        }

        const formData = new FormData();
        if (uploadType === 'profile') {
            formData.append('profileImage', selectedFile);
            formData.append('userType', user?.role === 'consultant' ? 'consultant' : 'client');
        } else {
            formData.append('document', selectedFile);
        }

        try {
            setUploadStatus('uploading');
            setUploadMessage('מעלה קובץ...');

            const endpoint = uploadType === 'profile' 
                ? '/api/uploads/profile-image' 
                : '/api/uploads/document';

            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setUploadStatus('success');
                setUploadMessage(`${uploadType === 'profile' ? 'תמונת פרופיל' : 'מסמך'} הועלה בהצלחה!`);
                setUploadedFileUrl(`http://localhost:3000${response.data.file.url}`);
                setSelectedFile(null);
                
                // איפוס שדה הקובץ
                const fileInput = document.getElementById('fileInput') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        } catch (error: unknown) {
            setUploadStatus('error');
            let errorMessage = `שגיאה בהעלאת ${uploadType === 'profile' ? 'תמונת פרופיל' : 'מסמך'}`;
            
            if (error && typeof error === 'object' && 'response' in error) {
                const response = (error as { response: { data: { message: string } } }).response;
                errorMessage = response?.data?.message || errorMessage;
            }
            
            setUploadMessage(errorMessage);
        }
    };

    const getFileIcon = (filename?: string): string => {
        const extension = filename?.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return '🖼️';
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            default:
                return '📁';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                העלאת קבצים
            </h2>

            {/* בחירת סוג העלאה */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    סוג העלאה:
                </label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="profile"
                            checked={uploadType === 'profile'}
                            onChange={(e) => setUploadType(e.target.value as 'profile' | 'document')}
                            className="mr-2"
                        />
                        <span className="text-gray-700">תמונת פרופיל</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="document"
                            checked={uploadType === 'document'}
                            onChange={(e) => setUploadType(e.target.value as 'profile' | 'document')}
                            className="mr-2"
                        />
                        <span className="text-gray-700">מסמך</span>
                    </label>
                </div>
            </div>

            {/* בחירת קובץ */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {uploadType === 'profile' ? 'בחר תמונת פרופיל:' : 'בחר מסמך:'}
                </label>
                <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileSelect}
                    accept={uploadType === 'profile' 
                        ? "image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        : "image/*,application/pdf,.doc,.docx"
                    }
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
                
                {uploadType === 'profile' && (
                    <p className="text-xs text-gray-500 mt-1">
                        קבצי תמונה בלבד (JPG, PNG, GIF, WebP) - עד 5MB
                    </p>
                )}
                {uploadType === 'document' && (
                    <p className="text-xs text-gray-500 mt-1">
                        תמונות, PDF, Word - עד 10MB
                    </p>
                )}
            </div>

            {/* תצוגת קובץ נבחר */}
            {selectedFile && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">קובץ נבחר:</h4>
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                        <div>
                            <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* כפתור העלאה */}
            <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadStatus === 'uploading'}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    !selectedFile || uploadStatus === 'uploading'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {uploadStatus === 'uploading' ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        מעלה...
                    </div>
                ) : (
                    `העלה ${uploadType === 'profile' ? 'תמונת פרופיל' : 'מסמך'}`
                )}
            </button>

            {/* הודעות סטטוס */}
            {uploadMessage && (
                <div className={`mt-4 p-4 rounded-lg ${
                    uploadStatus === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : uploadStatus === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                    <div className="flex items-center">
                        <span className="mr-2">
                            {uploadStatus === 'success' ? '✅' : 
                             uploadStatus === 'error' ? '❌' : 'ℹ️'}
                        </span>
                        {uploadMessage}
                    </div>
                </div>
            )}

            {/* תצוגת קובץ שהועלה */}
            {uploadedFileUrl && uploadType === 'profile' && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-3">תמונת פרופיל חדשה:</h4>
                    <div className="flex items-center space-x-4">
                        <img 
                            src={uploadedFileUrl} 
                            alt="Profile" 
                            className="w-20 h-20 rounded-full object-cover border-2 border-green-200"
                        />
                        <div>
                            <p className="text-sm text-green-700">התמונה הועלתה בהצלחה!</p>
                            <p className="text-xs text-green-600">
                                URL: <code className="bg-green-100 px-1 rounded">{uploadedFileUrl}</code>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {uploadedFileUrl && uploadType === 'document' && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-3">מסמך הועלה:</h4>
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">📄</span>
                        <div>
                            <p className="text-sm text-green-700">המסמך זמין לצפייה</p>
                            <a 
                                href={uploadedFileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                פתח מסמך 🔗
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
