import { useState } from 'react';
import FileUpload from '../../components/FileUpload';

const ProfileUploadPage = () => {
    const [currentTab, setCurrentTab] = useState<'upload' | 'gallery'>('upload');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ניהול קבצים אישיים
                    </h1>
                    <p className="text-gray-600">
                        העלה תמונת פרופיל ומסמכים רלוונטיים לחשבון שלך
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="flex bg-white rounded-lg shadow-sm border">
                        <button
                            onClick={() => setCurrentTab('upload')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${ 
                                currentTab === 'upload'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            📤 העלאת קבצים
                        </button>
                        <button
                            onClick={() => setCurrentTab('gallery')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                currentTab === 'gallery'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            🖼️ הקבצים שלי
                        </button>
                    </div>
                </div>

                {/* Content */}
                {currentTab === 'upload' && (
                    <div>
                        <FileUpload />
                        
                        {/* הוראות שימוש */}
                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-blue-900 mb-3">
                                💡 הוראות שימוש
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                                <div>
                                    <h4 className="font-medium mb-2">תמונת פרופיל:</h4>
                                    <ul className="space-y-1 text-blue-700">
                                        <li>• קבצי תמונה בלבד (JPG, PNG, GIF)</li>
                                        <li>• גודל מקסימלי: 5MB</li>
                                        <li>• מומלץ: 400x400 פיקסלים</li>
                                        <li>• תוצג בפרופיל שלך</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">מסמכים:</h4>
                                    <ul className="space-y-1 text-blue-700">
                                        <li>• PDF, Word, תמונות</li>
                                        <li>• גודל מקסימלי: 10MB</li>
                                        <li>• לשימוש ייעוץ עסקי</li>
                                        <li>• יועצים יראו את המסמכים</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'gallery' && (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📁</div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">
                                גלריית הקבצים שלך
                            </h3>
                            <p className="text-gray-500 mb-6">
                                כאן תוצגו כל הקבצים שהעלית - תכונה זו תיהיה זמינה בקרוב
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-sm text-yellow-800">
                                    🚧 <strong>בפיתוח:</strong> תכונה זו תכלול:
                                </p>
                                <ul className="text-xs text-yellow-700 mt-2 text-right">
                                    <li>• רשימת כל הקבצים שהועלו</li>
                                    <li>• אפשרות צפייה ומחיקה</li>
                                    <li>• ניהול קבצים מתקדם</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        הקבצים שלך מאובטחים ונשמרים על השרת שלנו 🔒
                        <br />
                        לשאלות: <a href="mailto:support@businessconsulting.co.il" className="text-blue-600 hover:underline">support@businessconsulting.co.il</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileUploadPage;
