import React, { useState, useEffect, useRef } from 'react';
import { Employee, Role, EmployeeAvailability, WeeklyAvailability } from '../types';
import { Trash2, Upload } from 'lucide-react';
import Modal from './Modal';
import Avatar from './Avatar';
import { useLanguage } from '../contexts/LanguageContext';
import AvailabilityEditor from './AvailabilityEditor';
import { useAuth } from '../contexts/AuthContext';

interface EmployeeEditorProps {
    employee: Employee | null;
    roles: Role[];
    onSave: (employee: Employee, isNew: boolean) => void;
    onClose: () => void;
    onDelete?: (employeeId: string) => void;
    employeeAvailability?: EmployeeAvailability;
    onSaveAvailability: (employeeId: string, availability: WeeklyAvailability) => void;
}

const GENDERS: Employee['gender'][] = ['Male', 'Female', 'Other', 'Prefer not to say'];

const getInitialFormData = (employee: Employee | null, roles: Role[]): Partial<Employee> => ({
    name: employee?.name || '',
    email: employee?.email || '',
    role: employee?.role || (roles[0]?.name || ''),
    avatarUrl: employee?.avatarUrl || null,
    phone: employee?.phone || '',
    gender: employee?.gender || 'Prefer not to say',
});

const EmployeeEditor: React.FC<EmployeeEditorProps> = ({ employee, roles, onSave, onClose, onDelete, employeeAvailability, onSaveAvailability }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [formData, setFormData] = useState<Partial<Employee>>(getInitialFormData(employee, roles));
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'availability'>('details');


    useEffect(() => {
        setFormData(getInitialFormData(employee, roles));
        setError('');
        setActiveTab('details');
    }, [employee, roles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            setError('Name and email are required.');
            return;
        }

        const isNew = !employee;
        const employeeToSave: Employee = {
            id: employee?.id || `emp-${Date.now()}`,
            name: formData.name!,
            email: formData.email!,
            role: formData.role || (roles[0]?.name || 'Unassigned'),
            avatarUrl: formData.avatarUrl || null,
            phone: formData.phone || '',
            gender: formData.gender || 'Prefer not to say',
            // Fix: Add missing companyId property
            companyId: user!.companyId,
        };
        onSave(employeeToSave, isNew);
    };

    const handleDelete = () => {
        if (employee && onDelete && window.confirm(t('modals.confirmDelete', { name: employee.name }))) {
            onDelete(employee.id);
        }
    };
    
    const title = employee ? t('modals.editEmployee') : t('modals.addEmployee');

    const tabClasses = (tabName: 'details' | 'availability') => 
        `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
            activeTab === tabName
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`;

    return (
        <Modal isOpen={true} onClose={onClose} title={title}>
            <div className="mb-4 border-b border-gray-200 dark:border-blue-night-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button onClick={() => setActiveTab('details')} className={tabClasses('details')}>
                        {t('modals.details')}
                    </button>
                    {employee && ( // Only show availability tab for existing employees
                         <button onClick={() => setActiveTab('availability')} className={tabClasses('availability')}>
                            {t('modals.availability')}
                        </button>
                    )}
                </nav>
            </div>
            
            {activeTab === 'details' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{error}</p>}
                    
                    <div className="flex flex-col items-center space-y-2">
                        <div className="relative">
                            <Avatar name={formData.name || ''} src={formData.avatarUrl} className="w-24 h-24 rounded-full" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors">
                                <Upload size={16} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="label-style">{t('modals.fullNameLabel')}</label>
                            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="email" className="label-style">{t('modals.emailLabel')}</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="input-style" />
                        </div>
                         <div>
                            <label htmlFor="phone" className="label-style">{t('modals.phoneLabel')}</label>
                            <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="gender" className="label-style">{t('modals.genderLabel')}</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="input-style">
                                {GENDERS.map(g => <option key={g} value={g}>{t(`gender.${g.toLowerCase().replace(/ /g, '').replace(/[^a-zA-Z]/g, '')}`)}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="role" className="label-style">{t('modals.roleLabel')}</label>
                            <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-style">
                                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                        <div>
                            {employee && onDelete && (
                                <button type="button" onClick={handleDelete} className="p-2 rounded-md text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80">
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-blue-night-800 hover:bg-gray-200 dark:hover:bg-blue-night-700">{t('modals.cancel')}</button>
                            <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">{t('modals.save')}</button>
                        </div>
                    </div>
                </form>
            )}

            {activeTab === 'availability' && employee && (
                <AvailabilityEditor
                    employeeId={employee.id}
                    initialAvailability={employeeAvailability?.availability}
                    onSave={onSaveAvailability}
                />
            )}

             <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; }
                .dark .label-style { color: #D1D5DB; }
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #FFFFFF; color: #111827; }
                .dark .input-style { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
            `}</style>
        </Modal>
    );
};

export default EmployeeEditor;