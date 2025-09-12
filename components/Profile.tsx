import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit, Upload, Lock, Gem } from 'lucide-react';
import Avatar from './Avatar';
import { useCurrency } from '../contexts/CurrencyContext';
import { Plan } from '../types';
import Modal from './Modal';

const ProfileCard: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
    <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h3>
        {children}
    </div>
);

const Profile: React.FC = () => {
    const { user, subscription, paymentHistory, updateUser, changePassword } = useAuth();
    const { t } = useLanguage();
    const { formatCurrency } = useCurrency();
    
    const [name, setName] = useState(user?.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

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

    const handlePasswordModalClose = () => {
        setIsPasswordModalOpen(false);
        setPasswordData({ current: '', new: '', confirm: '' });
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handlePasswordChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!passwordData.new) {
            setPasswordError(t('profile.passwordEmptyError'));
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            setPasswordError(t('profile.passwordMismatchError'));
            return;
        }
        
        const result = changePassword(passwordData.current, passwordData.new);
        if (result.success) {
            setPasswordSuccess(t(result.messageKey));
            setTimeout(handlePasswordModalClose, 1500); // Close after 1.5s
        } else {
            setPasswordError(t(result.messageKey));
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    const planPriceKeys: { [key in Plan]: string } = {
        'Gratuit': 'freePlanPrice',
        'Pro': 'proPlanPrice',
        'Pro Plus': 'proPlusPlanPrice'
    };
    
    const getPlanPrice = () => {
        if (!subscription) return 0;
        const priceKey = planPriceKeys[subscription.plan];
        return Number(t(`pricing.${priceKey}`));
    };
    
    const buttonPrimarySmClasses = "inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md transition-colors hover:bg-blue-700 dark:bg-blue-night-200 dark:text-blue-night-900 dark:hover:bg-blue-night-300 text-sm";
    const buttonPrimaryClasses = `inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md transition-colors hover:bg-blue-700 dark:bg-blue-night-200 dark:text-blue-night-900 dark:hover:bg-blue-night-300`;
    const buttonSecondaryClasses = "inline-flex items-center px-5 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-md transition-colors hover:bg-gray-300 dark:bg-blue-night-700 dark:text-blue-night-100 dark:hover:bg-blue-night-600";


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
                            className="absolute bottom-0 right-0 bg-blue-600 dark:bg-blue-night-200 text-white dark:text-blue-night-900 p-1.5 rounded-full hover:bg-blue-700 dark:hover:bg-blue-night-300 transition-colors"
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
                                <button onClick={handleNameSave} className={buttonPrimarySmClasses}>{t('modals.save')}</button>
                            </div>
                        ) : (
                             <div className="flex items-center space-x-3 justify-center md:justify-start">
                                <h4 className="text-2xl font-bold">{user.name}</h4>
                                <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-night-300">
                                    <Edit size={18} />
                                </button>
                            </div>
                        )}
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                        <div className="mt-2 inline-flex items-center rounded-full bg-yellow-100 dark:bg-blue-night-800 px-3 py-1 text-sm font-semibold text-yellow-800 dark:text-blue-night-300">
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
                    <button onClick={() => setIsPasswordModalOpen(true)} className={buttonSecondaryClasses}>
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
                            <p className="font-bold text-lg text-blue-800 dark:text-blue-night-200">{subscription.plan} {t('profile.plan')}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.renewsOn')} {subscription.renewalDate.toLocaleDateString()}</p>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(getPlanPrice())}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-center">
                        <div><span className="font-semibold block">{t('profile.startDate')}</span> {subscription.startDate.toLocaleDateString()}</div>
                        <div><span className="font-semibold block">{t('profile.nextPayment')}</span> {subscription.nextPaymentDate.toLocaleDateString()}</div>
                    </div>
                    <div className="mt-6 flex space-x-2 justify-end">
                        <button className={buttonSecondaryClasses}>{t('profile.cancelSubscription')}</button>
                        <button className={buttonPrimaryClasses}>{t('profile.upgradePlan')}</button>
                    </div>
                </ProfileCard>
            )}

            {/* Payment History */}
            {paymentHistory.length > 0 && (
                <ProfileCard title={t('profile.paymentHistory')}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-800 dark:text-gray-200">
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
                                        <td className="px-6 py-4">{formatCurrency(payment.amount)}</td>
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
            )}

            <Modal isOpen={isPasswordModalOpen} onClose={handlePasswordModalClose} title={t('profile.changePasswordTitle')}>
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                    {passwordError && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{passwordError}</p>}
                    {passwordSuccess && <p className="text-green-500 text-sm bg-green-100 dark:bg-green-900/30 p-2 rounded-md">{passwordSuccess}</p>}
                    <div>
                        <label className="label-style">{t('profile.currentPassword')}</label>
                        <input 
                            type="password" 
                            value={passwordData.current} 
                            onChange={e => setPasswordData({...passwordData, current: e.target.value})} 
                            required 
                            className="input-style"
                        />
                    </div>
                    <div>
                        <label className="label-style">{t('profile.newPassword')}</label>
                        <input 
                            type="password" 
                            value={passwordData.new} 
                            onChange={e => setPasswordData({...passwordData, new: e.target.value})} 
                            required 
                            className="input-style"
                        />
                    </div>
                     <div>
                        <label className="label-style">{t('profile.confirmNewPassword')}</label>
                        <input 
                            type="password" 
                            value={passwordData.confirm} 
                            onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} 
                            required 
                            className="input-style"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={handlePasswordModalClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-blue-night-800 hover:bg-gray-200 dark:hover:bg-blue-night-700">{t('modals.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">{t('modals.save')}</button>
                    </div>
                </form>
            </Modal>

            <style>{`
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #FFFFFF; color: #111827; }
                .dark .input-style { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; }
                .dark .label-style { color: #D1D5DB; }
            `}</style>
        </div>
    );
};

export default Profile;