import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plan, BusinessType, ActivitySector } from '../types';
import { Briefcase, Check, Calendar, Users, BarChart3, CalendarOff } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register';
    initialPlan?: Plan;
}

const PlanSelector: React.FC<{ selectedPlan: Plan, onSelect: (plan: Plan) => void }> = ({ selectedPlan, onSelect }) => {
    const { t } = useLanguage();
    const plans: Plan[] = ['Gratuit', 'Pro', 'Pro Plus'];
    const planKeys: { [key in Plan]: string } = {
        'Gratuit': 'freePlan',
        'Pro': 'proPlan',
        'Pro Plus': 'proPlusPlan',
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            {plans.map(plan => {
                const planKey = planKeys[plan];
                const isSelected = selectedPlan === plan;
                return (
                    <div
                        key={plan}
                        onClick={() => onSelect(plan)}
                        className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${isSelected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-200 dark:border-blue-night-700 hover:border-gray-400'}`}
                    >
                        <p className="font-bold text-sm">{t(`pricing.${planKey}Name`)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t(`pricing.${planKey}Price`)}</p>
                    </div>
                )
            })}
        </div>
    );
};

const FeatureItem: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-night-800">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    </div>
);


const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', initialPlan = 'Pro' }) => {
    const [view, setView] = useState(initialView);
    const { login, register } = useAuth();
    const { t } = useLanguage();
    const [error, setError] = useState('');
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plan, setPlan] = useState<Plan>(initialPlan);
    const [businessType, setBusinessType] = useState<BusinessType>('Company');
    const [activitySector, setActivitySector] = useState<ActivitySector | ''>('');
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setPlan(initialPlan);
            setError('');
            // Reset fields
            setName('');
            setEmail('');
            setPassword('');
            setBusinessType('Company');
            setActivitySector('');
            setCompanyName('');
            setAddress('');
        }
    }, [isOpen, initialView, initialPlan]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!login(email, password)) {
            setError(t('auth.invalidCredentials'));
        } else {
            onClose();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const finalCompanyName = companyName.trim() || name.trim();
        if (!finalCompanyName) {
            setError(t('auth.companyNameRequired'));
            return;
        }

        if (plan !== 'Gratuit') {
            console.log(`User ${email} is proceeding to payment for plan: ${plan}. Company: ${finalCompanyName}`);
            // In a real app, save form state and redirect to a payment page.
            // For now, we just close the modal as a simulation of the next step.
            alert(t('auth.redirectToPayment'));
            onClose();
            return;
        }

        // Handle free plan registration directly
        const registrationData = {
            name,
            email,
            plan,
            businessType,
            companyName: finalCompanyName,
            ...(activitySector && { activitySector }),
            ...(address && { address }),
        };
        
        if (!register(registrationData, password)) {
            setError(t('auth.emailExists'));
        } else {
            onClose();
        }
    };

    const toggleView = () => {
        setError('');
        setView(view === 'login' ? 'register' : 'login');
    };
    
    const title = view === 'login' ? t('auth.welcomeBack') : t('auth.createAccount');

    const toggleText = view === 'login' 
        ? t('auth.dontHaveAccount', { signUp: `<button class="font-semibold text-blue-600 hover:underline">${t('auth.signUp')}</button>` })
        : t('auth.alreadyHaveAccount', { signIn: `<button class="font-semibold text-blue-600 hover:underline">${t('auth.signIn')}</button>` });

    const planDetails: { [key in Plan]: { key: string; featureCount: number } } = {
        'Gratuit': { key: 'freePlan', featureCount: 3 },
        'Pro': { key: 'proPlan', featureCount: 4 },
        'Pro Plus': { key: 'proPlusPlan', featureCount: 4 },
    };
    const selectedPlanDetails = planDetails[plan];
    const selectedPlanFeatures = Array.from({ length: selectedPlanDetails.featureCount }, (_, i) => t(`pricing.${selectedPlanDetails.key}Feature${i + 1}`));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="4xl">
            <div className={`grid md:grid-cols-2 md:gap-10 ${view === 'register' ? 'min-h-[550px]' : ''} text-gray-900 dark:text-gray-100`}>
                {/* Left side: Form */}
                <div className="flex flex-col">
                    <div className="text-center mb-4">
                        <p 
                            className="text-sm text-gray-600 dark:text-gray-400"
                            onClick={(e) => { if((e.target as HTMLElement).tagName === 'BUTTON') toggleView()}}
                            dangerouslySetInnerHTML={{ __html: toggleText }}
                        >
                        </p>
                    </div>

                    {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 py-2 rounded-md">{error}</p>}
                    
                    {view === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4 flex-grow flex flex-col justify-center">
                            <div>
                                <label htmlFor="login-email" className="label-style">{t('auth.emailLabel')}</label>
                                <input id="login-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="label-style">{t('auth.passwordLabel')}</label>
                                <input id="login-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-style" />
                            </div>
                             <div className="text-right">
                                <a href="#" className="text-sm font-medium text-blue-600 hover:underline" onClick={(e) => {e.preventDefault(); alert('Password reset link would be sent!');}}>
                                    {t('auth.forgotPassword')}
                                </a>
                            </div>
                            <button type="submit" className="w-full button-primary">{t('auth.signIn')}</button>
                            
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                                <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">{t('auth.orSeparator')}</span>
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            
                            <div className="space-y-3">
                                <button type="button" onClick={() => alert('Logging in with Google...')} className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-blue-night-800">
                                    {t('auth.continueWithGoogle')}
                                </button>
                                <button type="button" onClick={() => alert('Logging in with Facebook...')} className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-blue-night-800">
                                    {t('auth.continueWithFacebook')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 -mr-2">
                            <h4 className="font-semibold border-b dark:border-blue-night-700 pb-1">{t('profile.profileDetails')}</h4>
                            <div>
                                <label htmlFor="register-name" className="label-style">{t('auth.fullNameLabel')}</label>
                                <input id="register-name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="register-email" className="label-style">{t('auth.emailLabel')}</label>
                                    <input id="register-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                                </div>
                                <div>
                                    <label htmlFor="register-password" className="label-style">{t('auth.passwordLabel')}</label>
                                    <input id="register-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-style" />
                                </div>
                            </div>

                            <h4 className="font-semibold border-b dark:border-blue-night-700 pb-1 pt-2">{t('auth.companyInfo')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="businessType" className="label-style">{t('auth.businessTypeLabel')}</label>
                                    <select id="businessType" name="businessType" value={businessType} onChange={e => setBusinessType(e.target.value as BusinessType)} className="input-style appearance-none">
                                        <option value="Company">{t('auth.businessTypeCompany')}</option>
                                        <option value="Individual">{t('auth.businessTypeIndividual')}</option>
                                        <option value="Other">{t('auth.businessTypeOther')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="activitySector" className="label-style">{t('auth.activitySectorLabel')}</label>
                                    <select id="activitySector" name="activitySector" value={activitySector} onChange={e => setActivitySector(e.target.value as ActivitySector)} className="input-style appearance-none">
                                        <option value="">-- {t('modals.none')} --</option>
                                        <option value="Individual">{t('auth.activitySectorIndividual')}</option>
                                        <option value="Health">{t('auth.activitySectorHealth')}</option>
                                        <option value="Technology">{t('auth.activitySectorTechnology')}</option>
                                        <option value="Administration">{t('auth.activitySectorAdministration')}</option>
                                        <option value="Finance">{t('auth.activitySectorFinance')}</option>
                                        <option value="Commerce">{t('auth.activitySectorCommerce')}</option>
                                        <option value="Social">{t('auth.activitySectorSocial')}</option>
                                        <option value="Other">{t('auth.activitySectorOther')}</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="companyName" className="label-style">{t('auth.companyNameLabel')}</label>
                                <input id="companyName" name="companyName" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={t('auth.companyNamePlaceholder')} required className="input-style" />
                            </div>
                             <div>
                                <label htmlFor="address" className="label-style">{t('auth.addressLabel')}</label>
                                <input id="address" name="address" type="text" value={address} onChange={e => setAddress(e.target.value)} className="input-style" />
                            </div>

                            <h4 className="font-semibold border-b dark:border-blue-night-700 pb-1 pt-2">{t('auth.selectedPlanLabel')}</h4>
                            <PlanSelector selectedPlan={plan} onSelect={setPlan} />
                            
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-blue-night-950 rounded-lg">
                                <h5 className="font-bold text-base">{t(`pricing.${selectedPlanDetails.key}Name`)} - {t(`pricing.${selectedPlanDetails.key}Desc`)}</h5>
                                <ul className="mt-2 space-y-2 text-sm">
                                    {selectedPlanFeatures.map((feature, index) => (
                                         <li key={index} className="flex items-start">
                                            <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" /> 
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button type="submit" className="w-full button-primary mt-4">
                                {plan === 'Gratuit' ? t('auth.createAccountButton') : t('auth.goToPayment')}
                            </button>
                        </form>
                    )}
                </div>
                
                {/* Right side: Info */}
                <div className="hidden md:flex flex-col bg-gray-50 dark:bg-blue-night-950 p-8 rounded-lg h-full">
                    {view === 'login' ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Briefcase className="w-16 h-16 text-blue-600" />
                            <h3 className="mt-4 text-2xl font-bold text-center text-gray-800 dark:text-white">{t('appName')}</h3>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                {t('landingPage.heroSubtitle')}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center h-full">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('auth.features.title')}</h3>
                            <div className="space-y-5">
                                <FeatureItem 
                                    icon={<Calendar size={24} className="text-blue-500"/>}
                                    title={t('auth.features.feature1Title')}
                                    description={t('auth.features.feature1Desc')}
                                />
                                <FeatureItem 
                                    icon={<Users size={24} className="text-blue-500"/>}
                                    title={t('auth.features.feature2Title')}
                                    description={t('auth.features.feature2Desc')}
                                />
                                <FeatureItem 
                                    icon={<BarChart3 size={24} className="text-blue-500"/>}
                                    title={t('auth.features.feature3Title')}
                                    description={t('auth.features.feature3Desc')}
                                />
                                <FeatureItem 
                                    icon={<CalendarOff size={24} className="text-blue-500"/>}
                                    title={t('auth.features.feature4Title')}
                                    description={t('auth.features.feature4Desc')}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
             <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; text-align: left; }
                .dark .label-style { color: #D1D5DB; }
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #FFFFFF; color: #111827; }
                .dark .input-style { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
                .button-primary { padding: 0.625rem 1.25rem; background-color: #2563EB; color: #FFFFFF; font-weight: 600; border-radius: 0.375rem; transition-property: background-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
                .button-primary:hover { background-color: #1D4ED8; }
            `}</style>
        </Modal>
    );
};

export default AuthModal;