import { useState } from 'react';
import FileUpload from '../../components/FileUpload';

const ManagerUploadPage = () => {
    const [currentTab, setCurrentTab] = useState<'upload' | 'manage'>('upload');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ניהול קבצים - פאנל יועץ
                    </h1>
                    <p className="text-gray-600">
                        העלה תמונת פרופיל, מסמכים ומדריכים עבור הלקוחות שלך
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                        <div className="text-3xl mb-2">👤</div>
                        <h3 className="font-medium text-gray-700 mb-1">תמונת פרופיל</h3>
                        <p className="text-sm text-gray-500">מאפשרת לקוחות לזהות אותך</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                        <div className="text-3xl mb-2">📄</div>
                        <h3 className="font-medium text-gray-700 mb-1">מסמכי עזר</h3>
                        <p className="text-sm text-gray-500">מדריכים וטפסים ללקוחות</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                        <div className="text-3xl mb-2">🔒</div>
                        <h3 className="font-medium text-gray-700 mb-1">אבטחה מלאה</h3>
                        <p className="text-sm text-gray-500">כל הקבצים מאובטחים</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="flex bg-white rounded-lg shadow-sm border">
                        <button
                            onClick={() => setCurrentTab('upload')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${ 
                                currentTab === 'upload'
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-600 hover:text-green-600'
                            }`}
                        >
                            📤 העלאת קבצים
                        </button>
                        <button
                            onClick={() => setCurrentTab('manage')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                currentTab === 'manage'
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-600 hover:text-green-600'
                            }`}
                        >
                            📋 ניהול קבצים
                        </button>
                    </div>
                </div>

                {/* Content */}
                {currentTab === 'upload' && (
                    <div>
                        <FileUpload />
                        
                        {/* הוראות מיוחדות ליועצים */}
                        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-green-900 mb-3">
                                👨‍💼 הוראות ליועצים עסקיים
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6 text-sm text-green-800">
                                <div>
                                    <h4 className="font-medium mb-3">תמונת פרופיל מקצועית:</h4>
                                    <ul className="space-y-2 text-green-700">
                                        <li>• 📸 תמונה מקצועית וברורה</li>
                                        <li>• 👔 לבוש עסקי מכובד</li>
                                        <li>• 😊 ביטוי פנים ידידותי</li>
                                        <li>• 🎯 רזולוציה גבוהה (מעל 400px)</li>
                                        <li>• 🖼️ רקע נייטרלי או משרדי</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-3">מסמכים מקצועיים:</h4>
                                    <ul className="space-y-2 text-green-700">
                                        <li>• 📋 מדריכים ללקוחות</li>
                                        <li>• 📊 דוחות ותבניות</li>
                                        <li>• 📝 טפסים לייעוץ</li>
                                        <li>• 🎓 תעודות והכשרות</li>
                                        <li>• 📄 חומרי עזר מקצועיים</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* טיפים מקצועיים */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-blue-900 mb-3">
                                💡 טיפים לייעוץ מקצועי
                            </h3>
                            <div className="text-sm text-blue-800 space-y-2">
                                <p><strong>יצירת אמון:</strong> תמונת פרופיל איכותית מגדילה את האמון של לקוחות פוטנציאליים ב-67%</p>
                                <p><strong>נגישות מידע:</strong> מסמכי עזר זמינים מקדמים תהליכי ייעוץ יעילים יותר</p>
                                <p><strong>מקצועיות:</strong> חומרים מעוצבים ומסודרים משדרים מקצועיות ויכולת</p>
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'manage' && (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">
                                ניהול קבצים מתקדם
                            </h3>
                            <p className="text-gray-500 mb-6">
                                כאן תוכל לנהל את כל הקבצים שלך ולראות סטטיסטיקות שימוש
                            </p>
                            
                            {/* Future Features Preview */}
                            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-700 mb-2">🗂️ ניהול קבצים</h4>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• רשימת כל הקבצים</li>
                                        <li>• עריכה ומחיקה</li>
                                        <li>• ארגון בתיקיות</li>
                                        <li>• גיבוי אוטומטי</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-700 mb-2">📈 סטטיסטיקות</h4>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• כמות הורדות</li>
                                        <li>• קבצים פופולריים</li>
                                        <li>• שימוש בלקוחות</li>
                                        <li>• דוחות חודשיים</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-sm text-amber-800">
                                    🚧 <strong>בפיתוח:</strong> תכונות ניהול מתקדמות יהיו זמינות בגרסה הבאה
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        שרת יועצים מאובטח 🛡️ | גיבוי יומי 💾 | תמיכה 24/6 📞
                        <br />
                        לתמיכה טכנית: <a href="mailto:tech@businessconsulting.co.il" className="text-green-600 hover:underline">tech@businessconsulting.co.il</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManagerUploadPage;
