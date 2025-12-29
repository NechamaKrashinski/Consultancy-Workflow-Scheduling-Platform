import { useState, useEffect } from 'react';
import api from '../services/api';

interface ProfileData {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    profile_image?: string;
}

const ProfileViewPage = () => {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/profile');
            setProfileData(response.data);
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error as { response: { data: { message: string } } }).response?.data?.message || 'שגיאה בטעינת הפרופיל'
                : 'שגיאה בטעינת הפרופיל';
            setError(errorMessage);
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    ❌ {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                הפרופיל שלי
            </h2>

            <div className="space-y-6">
                {/* תמונת פרופיל */}
                <div className="text-center">
                    {profileData?.profile_image ? (
                        <div className="inline-block">
                            <img 
                                src={`http://localhost:3000${profileData.profile_image}`}
                                alt="תמונת פרופיל"
                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mx-auto"
                            />
                            <p className="text-sm text-gray-500 mt-2">תמונת פרופיל</p>
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                            <span className="text-4xl text-gray-400">👤</span>
                        </div>
                    )}
                </div>

                {/* פרטי הפרופיל */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            שם:
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                            {profileData?.name}
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            אימייל:
                        </label>
                        <p className="text-lg text-gray-900">
                            {profileData?.email}
                        </p>
                    </div>

                    {profileData?.phone && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                טלפון:
                            </label>
                            <p className="text-lg text-gray-900">
                                {profileData.phone}
                            </p>
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            תפקיד:
                        </label>
                        <p className="text-lg text-gray-900">
                            {profileData?.role === 'client' ? 'לקוח' : 
                             profileData?.role === 'manager' ? 'מנהל' : 'יועץ'}
                        </p>
                    </div>
                </div>

                {/* הודעת הצלחה אם יש תמונה */}
                {profileData?.profile_image && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                            <span className="mr-2">✅</span>
                            תמונת הפרופיל שלך מוצגת בהצלחה!
                        </div>
                    </div>
                )}

                {/* כפתור רענון */}
                <div className="text-center">
                    <button
                        onClick={fetchProfile}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        🔄 רענן פרופיל
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileViewPage;
