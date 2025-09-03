import React, { useState, useEffect } from 'react';
import { SpecialDay, SpecialDayType } from '../types';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SpecialDayEditorProps {
    date: Date;
    specialDay: SpecialDay | null;
    specialDayTypes: SpecialDayType[];
    onSave: (specialDay: SpecialDay) => void;
    onCancel: () => void;
    onDelete?: (specialDayId: string) => void;
}

const toInputDateString = (date: Date) => date.toISOString().split('T')[0];

const SpecialDayEditor: React.FC<SpecialDayEditorProps> = ({ date, specialDay, specialDayTypes, onSave, onCancel, onDelete }) => {
    const { t } = useLanguage();
    
    const getInitialState = () => ({
        typeId: specialDay?.typeId || (specialDayTypes[0]?.id || ''),
        coverage: specialDay?.coverage || 'all-day',
    });

    const [formData, setFormData] = useState(getInitialState);

    useEffect(() => {
        setFormData(getInitialState());
    }, [specialDay, specialDayTypes]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedSpecialDay: SpecialDay = {
            id: specialDay?.id || `sd-${date.getTime()}`,
            date: date,
            typeId: formData.typeId,
            coverage: formData.coverage as SpecialDay['coverage'],
        };
        onSave(updatedSpecialDay);
    };

    const handleDelete = () => {
        if (specialDay && onDelete && window.confirm('Are you sure you want to remove this special day?')) {
            onDelete(specialDay.id);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-style">{t('modals.dateLabel')}</label>
                <input type="text" value={date.toLocaleDateString()} disabled className="input-style mt-1 bg-gray-100 dark:bg-blue-night-800" />
            </div>

            <div>
                <label htmlFor="typeId" className="label-style">{t('modals.typeLabel')}</label>
                <select id="typeId" name="typeId" value={formData.typeId} onChange={handleChange} className="input-style mt-1">
                    {specialDayTypes.map(sdt => <option key={sdt.id} value={sdt.id}>{sdt.name}</option>)}
                </select>
            </div>
            
            <div>
                <label htmlFor="coverage" className="label-style">{t('modals.coverageLabel')}</label>
                <select id="coverage" name="coverage" value={formData.coverage} onChange={handleChange} className="input-style mt-1">
                    <option value="all-day">{t('modals.coverageAllDay')}</option>
                    <option value="morning">{t('modals.coverageMorning')}</option>
                    <option value="afternoon">{t('modals.coverageAfternoon')}</option>
                    <option value="evening">{t('modals.coverageEvening')}</option>
                </select>
            </div>


            <div className="flex justify-between items-center pt-4">
                <div>
                    {specialDay && onDelete && (
                        <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-md text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-blue-night-800 hover:bg-gray-200 dark:hover:bg-blue-night-700">{t('modals.cancel')}</button>
                    <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">{t('modals.save')}</button>
                </div>
            </div>
             <style>{`
                .label-style { display: block; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; }
                .dark .label-style { color: #D1D5DB; }
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #FFFFFF; color: #111827; }
                .dark .input-style { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
            `}</style>
        </form>
    );
};

export default SpecialDayEditor;