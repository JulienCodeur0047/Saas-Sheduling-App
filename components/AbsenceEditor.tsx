import React, { useState, useEffect } from 'react';
import { Absence, Employee, AbsenceType, Shift, SpecialDay, SpecialDayType } from '../types';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AbsenceEditorProps {
    absence: Absence | null;
    employees: Employee[];
    absenceTypes: AbsenceType[];
    allShifts: Shift[];
    allSpecialDays: SpecialDay[];
    allSpecialDayTypes: SpecialDayType[];
    onSave: (absence: Absence) => void;
    onCancel: () => void;
    onDelete?: (absenceId: string) => void;
}

const toInputDateString = (date: Date) => date.toISOString().split('T')[0];

const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const AbsenceEditor: React.FC<AbsenceEditorProps> = (props) => {
    const { absence, employees, absenceTypes, allShifts, allSpecialDays, allSpecialDayTypes, onSave, onCancel, onDelete } = props;
    const { t } = useLanguage();
    
    const getInitialState = () => {
        const today = new Date();
        return {
            employeeId: absence?.employeeId || (employees[0]?.id || ''),
            absenceTypeId: absence?.absenceTypeId || (absenceTypes[0]?.id || ''),
            startDate: toInputDateString(absence?.startDate || today),
            endDate: toInputDateString(absence?.endDate || today),
        };
    };

    const [formData, setFormData] = useState(getInitialState);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFormData(getInitialState());
    }, [absence, employees, absenceTypes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newStartDate = new Date(formData.startDate);
        newStartDate.setHours(0,0,0,0);
        const newEndDate = new Date(formData.endDate);
        newEndDate.setHours(23,59,59,999);

        if (newEndDate < newStartDate) {
            setError("End date must be after start date.");
            return;
        }
        
        if (!formData.employeeId || !formData.absenceTypeId) {
             setError("Please select an employee and an absence type.");
            return;
        }

        // Holiday conflict
        for (let d = new Date(newStartDate); d <= newEndDate; d.setDate(d.getDate() + 1)) {
            const holidayOnDay = allSpecialDays.find(sd => {
                const type = allSpecialDayTypes.find(sdt => sdt.id === sd.typeId);
                return isSameDay(sd.date, d) && type?.isHoliday && sd.coverage === 'all-day';
            });
            if (holidayOnDay) {
                const typeName = allSpecialDayTypes.find(sdt => sdt.id === holidayOnDay.typeId)?.name || 'Holiday';
                setError(`Cannot schedule absence on a ${typeName} (${d.toLocaleDateString()}).`);
                return;
            }
        }

        // Conflict detection with shifts
        const conflictingShift = allShifts.find(shift => {
            if (shift.employeeId !== formData.employeeId) return false;
            // Check if the shift range overlaps with the absence range
            const shiftStart = new Date(shift.startTime);
            const shiftEnd = new Date(shift.endTime);
            return shiftStart < newEndDate && shiftEnd > newStartDate;
        });

        if (conflictingShift) {
            const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setError(`This employee has a conflicting shift from ${formatTime(conflictingShift.startTime)} to ${formatTime(conflictingShift.endTime)}.`);
            return;
        }

        const updatedAbsence: Absence = {
            id: absence?.id || `absence-${Date.now()}`,
            employeeId: formData.employeeId,
            absenceTypeId: formData.absenceTypeId,
            startDate: newStartDate,
            endDate: newEndDate,
        };
        onSave(updatedAbsence);
    };

    const handleDelete = () => {
        if (absence && onDelete && window.confirm('Are you sure you want to delete this absence entry?')) {
            onDelete(absence.id);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{error}</p>}
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="employeeId" className="label-style">{t('modals.employeeLabel')}</label>
                    <select id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} className="input-style mt-1">
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="absenceTypeId" className="label-style">{t('modals.absenceTypeLabel')}</label>
                    <select id="absenceTypeId" name="absenceTypeId" value={formData.absenceTypeId} onChange={handleChange} className="input-style mt-1">
                        {absenceTypes.map(at => <option key={at.id} value={at.id}>{at.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="label-style">{t('modals.startDateLabel')}</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="input-style mt-1" />
                </div>
                <div>
                    <label htmlFor="endDate" className="label-style">{t('modals.endDateLabel')}</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="input-style mt-1" />
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <div>
                    {absence && onDelete && (
                        <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-md text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-blue-night-800 hover:bg-gray-200 dark:hover:bg-blue-night-700">{t('modals.cancel')}</button>
                    <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">{t('modals.saveAbsence')}</button>
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

export default AbsenceEditor;