import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit, Upload, Lock, Gem } from 'lucide-react';
import Avatar from './Avatar';

const ProfileCard: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
    <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h3>
        {children}
    </div>
);

const Profile: React.FC = () => {
    const { user, subscription, paymentHistory, updateUser } = useAuth();
    const { t } = useLanguage();
    
    const [name, setName] = useState(user?.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNameSave = () => {
        if (name.trim() && user) {
            updateUser({ name: name.trim() });
            setIsEditingName(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('profile.title')}</h2>
            
            {/* Profile Details */}
            <ProfileCard title={t('profile.profileDetails')}>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                     <div className="relative">
                        <Avatar name={user.name} src={user.avatarUrl} className="w-24 h-24 rounded-full" />
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
                            aria-label="Upload new avatar"
                        >
                            <Upload size={16} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        {isEditingName ? (
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-style"
                                />
                                <button onClick={handleNameSave} className="button-primary-sm">{t('modals.save')}</button>
                            </div>
                        ) : (
                             <div className="flex items-center space-x-3 justify-center md:justify-start">
                                <h4 className="text-2xl font-bold">{user.name}</h4>
                                <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-blue-600">
                                    <Edit size={18} />
                                </button>
                            </div>
                        )}
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                        <div className="mt-2 inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                            <Gem size={14} className="mr-1.5" />
                            {user.plan} {t('profile.plan')}
                        </div>
                    </div>
                </div>
            </ProfileCard>
            
             {/* Company Information */}
            <ProfileCard title={t('profile.companyInformation')}>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2 border-b dark:border-blue-night-800">
                        <span className="font-medium text-gray-500 dark:text-gray-400">{t('profile.companyName')}</span>
                        <span className="font-semibold text-right">{user.companyName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b dark:border-blue-night-800">
                        <span className="font-medium text-gray-500 dark:text-gray-400">{t('profile.businessType')}</span>
                        <span className="font-semibold">{t(`auth.businessType${user.businessType}`)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b dark:border-blue-night-800">
                        <span className="font-medium text-gray-500 dark:text-gray-400">{t('profile.activitySector')}</span>
                        <span className="font-semibold">{user.activitySector ? t(`auth.activitySector${user.activitySector.replace(/\s/g, '')}`) : t('profile.notProvided')}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-gray-500 dark:text-gray-400">{t('profile.address')}</span>
                        <span className="font-semibold text-right">{user.address || t('profile.notProvided')}</span>
                    </div>
                </div>
            </ProfileCard>

             {/* Security */}
             <ProfileCard title={t('profile.security')}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium">{t('profile.password')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.passwordLastChanged')}</p>
                    </div>
                    <button className="button-secondary">
                        <Lock size={16} className="mr-2" />
                        {t('profile.changePassword')}
                    </button>
                </div>
            </ProfileCard>

            {/* Subscription */}
            {subscription && (
                <ProfileCard title={t('profile.subscription')}>
                    <div className="bg-blue-50 dark:bg-blue-night-800/50 p-4 rounded-lg mb-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg text-blue-800 dark:text-blue-200">{subscription.plan} {t('profile.plan')}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.renewsOn')} {subscription.renewalDate.toLocaleDateString()}</p>
                        </div>
                        <p className="text-2xl font-bold">$20<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-center">
                        <div><span className="font-semibold block">{t('profile.startDate')}</span> {subscription.startDate.toLocaleDateString()}</div>
                        <div><span className="font-semibold block">{t('profile.nextPayment')}</span> {subscription.nextPaymentDate.toLocaleDateString()}</div>
                    </div>
                    <div className="mt-6 flex space-x-2 justify-end">
                        <button className="button-secondary">{t('profile.cancelSubscription')}</button>
                        <button className="button-primary">{t('profile.upgradePlan')}</button>
                    </div>
                </ProfileCard>
            )}

            {/* Payment History */}
            <ProfileCard title={t('profile.paymentHistory')}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-blue-night-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('profile.paymentDate')}</th>
                                <th scope="col" className="px-6 py-3">{t('profile.paymentAmount')}</th>
                                <th scope="col" className="px-6 py-3">{t('profile.paymentPlan')}</th>
                                <th scope="col" className="px-6 py-3">{t('profile.paymentStatus')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map(payment => (
                                <tr key={payment.id} className="border-b dark:border-blue-night-700 hover:bg-gray-50 dark:hover:bg-blue-night-800/50">
                                    <td className="px-6 py-4">{payment.date.toLocaleDateString()}</td>
                                    <td className="px-6 py-4">${payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">{payment.plan}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800'}`}>
                                            {t(`profile.paymentStatus${payment.status}`)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ProfileCard>

            <style>{`
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #FFFFFF; color: #111827; }
                .dark .input-style { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
                .button-primary { display: inline-flex; align-items: center; padding: 0.625rem 1.25rem; background-color: #2563EB; color: #FFFFFF; font-weight: 600; border-radius: 0.375rem; transition: background-color 150ms; }
                .button-primary:hover { background-color: #1D4ED8; }
                .button-primary-sm { display: inline-flex; align-items: center; padding: 0.5rem 1rem; background-color: #2563EB; color: #FFFFFF; font-weight: 600; border-radius: 0.375rem; transition: background-color 150ms; }
                .button-primary-sm:hover { background-color: #1D4ED8; }
                .button-secondary { display: inline-flex; align-items: center; padding: 0.625rem 1.25rem; background-color: #E5E7EB; color: #1F2937; font-weight: 600; border-radius: 0.375rem; transition: background-color 150ms; }
                .dark .button-secondary { background-color: #374151; color: #F9FAFB; }
                .button-secondary:hover { background-color: #D1D5DB; }
                .dark .button-secondary:hover { background-color: #4B5563; }
            `}</style>
        </div>
    );
};

export default Profile;