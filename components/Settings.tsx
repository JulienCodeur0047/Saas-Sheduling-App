import React, { useState } from 'react';
import { Role, Employee, Location, Shift, Department, AbsenceType, Absence, SpecialDayType, SpecialDay } from '../types';
import { PlusCircle, Edit, Trash2, Check, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
    roles: Role[];
    employees: Employee[];
    locations: Location[];
    shifts: Shift[];
    departments: Department[];
    absenceTypes: AbsenceType[];
    absences: Absence[];
    specialDayTypes: SpecialDayType[];
    specialDays: SpecialDay[];
    onAddRole: (name: string) => void;
    onUpdateRole: (id: string, name: string) => void;
    onDeleteRole: (id: string) => void;
    onAddLocation: (name: string, address?: string) => void;
    onUpdateLocation: (id: string, name: string, address?: string) => void;
    onDeleteLocation: (id: string) => void;
    onAddDepartment: (name: string) => void;
    onUpdateDepartment: (id: string, name: string) => void;
    onDeleteDepartment: (id: string) => void;
    onAddAbsenceType: (name: string, color: string) => void;
    onUpdateAbsenceType: (id: string, name: string, color: string) => void;
    onDeleteAbsenceType: (id: string) => void;
    onAddSpecialDayType: (name: string, isHoliday: boolean) => void;
    onUpdateSpecialDayType: (id: string, name: string, isHoliday: boolean) => void;
    onDeleteSpecialDayType: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = (props) => {
    const { 
        roles, employees, locations, shifts, departments, absenceTypes, absences, specialDayTypes, specialDays,
        onAddRole, onUpdateRole, onDeleteRole,
        onAddLocation, onUpdateLocation, onDeleteLocation,
        onAddDepartment, onUpdateDepartment, onDeleteDepartment,
        onAddAbsenceType, onUpdateAbsenceType, onDeleteAbsenceType,
        onAddSpecialDayType, onUpdateSpecialDayType, onDeleteSpecialDayType,
    } = props;
    
    const { t } = useLanguage();

    // State for various forms
    const [newRoleName, setNewRoleName] = useState('');
    const [editingRole, setEditingRole] = useState<{ id: string, name: string } | null>(null);

    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationAddress, setNewLocationAddress] = useState('');
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

    const [newAbsenceTypeName, setNewAbsenceTypeName] = useState('');
    const [newAbsenceTypeColor, setNewAbsenceTypeColor] = useState('#f44336');
    const [editingAbsenceType, setEditingAbsenceType] = useState<AbsenceType | null>(null);
    
    const [newSpecialDayTypeName, setNewSpecialDayTypeName] = useState('');
    const [newSpecialDayTypeIsHoliday, setNewSpecialDayTypeIsHoliday] = useState(true);
    const [editingSpecialDayType, setEditingSpecialDayType] = useState<SpecialDayType | null>(null);


    // Handlers
    const handleAddRole = () => { if (newRoleName.trim()) { onAddRole(newRoleName.trim()); setNewRoleName(''); } };
    const handleUpdateRole = () => { if (editingRole && editingRole.name.trim()) { onUpdateRole(editingRole.id, editingRole.name.trim()); setEditingRole(null); } };
    const handleDeleteRole = (id: string) => { if (window.confirm(`Delete role?`)) { onDeleteRole(id); }};

    const handleAddLocation = () => { if (newLocationName.trim()) { onAddLocation(newLocationName.trim(), newLocationAddress.trim()); setNewLocationName(''); setNewLocationAddress(''); }};
    const handleUpdateLocation = () => { if (editingLocation && editingLocation.name.trim()) { onUpdateLocation(editingLocation.id, editingLocation.name.trim(), editingLocation.address); setEditingLocation(null); }};
    const handleDeleteLocation = (id: string) => { if (window.confirm(`Delete location?`)) { onDeleteLocation(id); }};

    const handleAddDepartment = () => { if (newDepartmentName.trim()) { onAddDepartment(newDepartmentName.trim()); setNewDepartmentName(''); }};
    const handleUpdateDepartment = () => { if (editingDepartment && editingDepartment.name.trim()) { onUpdateDepartment(editingDepartment.id, editingDepartment.name.trim()); setEditingDepartment(null); }};
    const handleDeleteDepartment = (id: string) => { if (window.confirm(`Delete department?`)) { onDeleteDepartment(id); }};

    const handleAddAbsenceType = () => { if (newAbsenceTypeName.trim()) { onAddAbsenceType(newAbsenceTypeName.trim(), newAbsenceTypeColor); setNewAbsenceTypeName(''); setNewAbsenceTypeColor('#f44336'); }};
    const handleUpdateAbsenceType = () => { if (editingAbsenceType && editingAbsenceType.name.trim()) { onUpdateAbsenceType(editingAbsenceType.id, editingAbsenceType.name.trim(), editingAbsenceType.color); setEditingAbsenceType(null); }};
    const handleDeleteAbsenceType = (id: string) => { if (window.confirm(`Delete absence type?`)) { onDeleteAbsenceType(id); }};
    
    const handleAddSpecialDayType = () => { if (newSpecialDayTypeName.trim()) { onAddSpecialDayType(newSpecialDayTypeName.trim(), newSpecialDayTypeIsHoliday); setNewSpecialDayTypeName(''); setNewSpecialDayTypeIsHoliday(true); }};
    const handleUpdateSpecialDayType = () => { if (editingSpecialDayType && editingSpecialDayType.name.trim()) { onUpdateSpecialDayType(editingSpecialDayType.id, editingSpecialDayType.name.trim(), editingSpecialDayType.isHoliday); setEditingSpecialDayType(null); }};
    const handleDeleteSpecialDayType = (id: string) => { if (window.confirm(`Delete special day type?`)) { onDeleteSpecialDayType(id); }};
    
    // Usage counters
    const countEmployeesInRole = (roleName: string) => employees.filter(e => e.role === roleName).length;
    const countShiftsAtLocation = (locationId: string) => shifts.filter(s => s.locationId === locationId).length;
    const countEmployeesInDept = (deptId: string) => new Set(shifts.filter(s => s.departmentId === deptId).map(s => s.employeeId)).size;
    const countAbsencesOfType = (typeId: string) => absences.filter(a => a.absenceTypeId === typeId).length;
    const countSpecialDaysOfType = (typeId: string) => specialDays.filter(sd => sd.typeId === typeId).length;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('settings.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manage Roles */}
                <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('settings.manageRoles')}</h3>
                     <div className="flex items-center space-x-2 mb-4">
                        <input type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder={t('settings.newRolePlaceholder')} className="input-field"/>
                        <button onClick={handleAddRole} className="button-icon-primary"><PlusCircle size={20} /></button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {roles.map(role => ( <ListItem key={role.id} text={role.name} count={countEmployeesInRole(role.name)} countLabel={t('settings.usersCount')} isEditing={editingRole?.id === role.id} onEdit={() => setEditingRole({ ...role })} onCancel={() => setEditingRole(null)} onSave={handleUpdateRole} onDelete={() => handleDeleteRole(role.id)} editValue={editingRole?.name} onEditChange={(val) => setEditingRole(e => e ? {...e, name: val} : null)} /> ))}
                    </div>
                </div>

                {/* Manage Departments */}
                 <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('settings.manageDepartments')}</h3>
                     <div className="flex items-center space-x-2 mb-4">
                        <input type="text" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} placeholder={t('settings.newDepartmentPlaceholder')} className="input-field"/>
                        <button onClick={handleAddDepartment} className="button-icon-primary"><PlusCircle size={20} /></button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {departments.map(dept => ( <ListItem key={dept.id} text={dept.name} count={countEmployeesInDept(dept.id)} countLabel={t('settings.employeesCount')} isEditing={editingDepartment?.id === dept.id} onEdit={() => setEditingDepartment({ ...dept })} onCancel={() => setEditingDepartment(null)} onSave={handleUpdateDepartment} onDelete={() => handleDeleteDepartment(dept.id)} editValue={editingDepartment?.name} onEditChange={(val) => setEditingDepartment(e => e ? {...e, name: val} : null)} /> ))}
                    </div>
                </div>

                {/* Manage Locations */}
                 <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('settings.manageLocations')}</h3>
                    <div className="space-y-2 mb-4">
                        <input type="text" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} placeholder={t('settings.newLocationPlaceholder')} className="input-field"/>
                        <input type="text" value={newLocationAddress} onChange={(e) => setNewLocationAddress(e.target.value)} placeholder={t('settings.addressPlaceholder')} className="input-field"/>
                        <button onClick={handleAddLocation} className="w-full button-primary"><PlusCircle size={20} className="mr-2" /> {t('settings.addLocation')}</button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {locations.map(loc => ( <ListItem key={loc.id} text={loc.name} subtext={loc.address} count={countShiftsAtLocation(loc.id)} countLabel={t('settings.shiftsCount')} isEditing={editingLocation?.id === loc.id} onEdit={() => setEditingLocation({ ...loc })} onCancel={() => setEditingLocation(null)} onSave={handleUpdateLocation} onDelete={() => handleDeleteLocation(loc.id)} isLocationEditor={true} editValue={editingLocation?.name} onEditChange={(val) => setEditingLocation(e => e ? {...e, name: val} : null)} editSubValue={editingLocation?.address} onEditSubChange={(val) => setEditingLocation(e => e ? {...e, address: val} : null)} /> ))}
                    </div>
                </div>
                
                 {/* Manage Absence Types */}
                 <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('settings.manageAbsenceTypes')}</h3>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2">
                            <input type="text" value={newAbsenceTypeName} onChange={(e) => setNewAbsenceTypeName(e.target.value)} placeholder={t('settings.newAbsenceTypePlaceholder')} className="input-field flex-grow"/>
                            <input type="color" value={newAbsenceTypeColor} onChange={(e) => setNewAbsenceTypeColor(e.target.value)} className="h-10 w-10 p-1 rounded-md bg-gray-50 dark:bg-blue-night-800 border dark:border-blue-night-700"/>
                        </div>
                        <button onClick={handleAddAbsenceType} className="w-full button-primary"><PlusCircle size={20} className="mr-2"/> {t('settings.addAbsenceType')}</button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                       {absenceTypes.map(at => ( <ListItem key={at.id} text={at.name} count={countAbsencesOfType(at.id)} countLabel={t('settings.absencesCount')} colorIndicator={at.color} isEditing={editingAbsenceType?.id === at.id} onEdit={() => setEditingAbsenceType({ ...at })} onCancel={() => setEditingAbsenceType(null)} onSave={handleUpdateAbsenceType} onDelete={() => handleDeleteAbsenceType(at.id)} isAbsenceTypeEditor={true} editValue={editingAbsenceType?.name} onEditChange={(val) => setEditingAbsenceType(e => e ? {...e, name: val} : null)} editColorValue={editingAbsenceType?.color} onEditColorChange={(val) => setEditingAbsenceType(e => e ? {...e, color: val} : null)} /> ))}
                    </div>
                </div>

                {/* Manage Special Day Types */}
                <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('settings.manageSpecialDayTypes')}</h3>
                    <div className="space-y-2 mb-4">
                        <input type="text" value={newSpecialDayTypeName} onChange={(e) => setNewSpecialDayTypeName(e.target.value)} placeholder={t('settings.newSpecialDayTypePlaceholder')} className="input-field"/>
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" checked={newSpecialDayTypeIsHoliday} onChange={(e) => setNewSpecialDayTypeIsHoliday(e.target.checked)} className="rounded"/>
                            <span>{t('settings.blocksShifts')}</span>
                        </label>
                        <button onClick={handleAddSpecialDayType} className="w-full button-primary"><PlusCircle size={20} className="mr-2"/> {t('settings.addSpecialDayType')}</button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {specialDayTypes.map(sdt => ( <ListItem key={sdt.id} text={sdt.name} subtext={sdt.isHoliday ? 'Holiday (blocks schedule)' : 'Event'} count={countSpecialDaysOfType(sdt.id)} countLabel={t('settings.daysCount')} isEditing={editingSpecialDayType?.id === sdt.id} onEdit={() => setEditingSpecialDayType({ ...sdt })} onCancel={() => setEditingSpecialDayType(null)} onSave={handleUpdateSpecialDayType} onDelete={() => handleDeleteSpecialDayType(sdt.id)} isSpecialDayTypeEditor={true} editValue={editingSpecialDayType?.name} onEditChange={(val) => setEditingSpecialDayType(e => e ? {...e, name: val} : null)} editIsHoliday={editingSpecialDayType?.isHoliday} onEditIsHolidayChange={(val) => setEditingSpecialDayType(e => e ? {...e, isHoliday: val} : null)} /> ))}
                    </div>
                </div>

            </div>
             <style>{`
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #F9FAFB; }
                .dark .input-field { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
                .button-primary { display: flex; align-items: center; justify-content: center; width: 100%; padding: 0.5rem 1rem; background-color: #2563EB; color: #FFFFFF; font-weight: 600; border-radius: 0.5rem; }
                .button-primary:hover { background-color: #1D4ED8; }
                .button-icon-primary { display: flex; align-items: center; justify-content: center; padding: 0.5rem; background-color: #2563EB; color: #FFFFFF; font-weight: 600; border-radius: 0.5rem; }
                .button-icon-primary:hover { background-color: #1D4ED8; }
            `}</style>
        </div>
    );
};

// Reusable list item component for settings
const ListItem = (props: any) => {
    const { 
        isEditing, onSave, onCancel, onEdit, onDelete, text, subtext, count, countLabel, colorIndicator, 
        editValue, onEditChange, editSubValue, onEditSubChange, editColorValue, onEditColorChange, 
        editIsHoliday, onEditIsHolidayChange,
        isLocationEditor, isAbsenceTypeEditor, isSpecialDayTypeEditor
    } = props;
    
    return (
        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-blue-night-800 rounded-lg">
            {isEditing ? (
                 <div className="flex-grow space-y-2">
                    <input type="text" value={editValue} onChange={(e) => onEditChange(e.target.value)} className="input-field"/>
                    {isLocationEditor && <input type="text" value={editSubValue || ''} onChange={(e) => onEditSubChange(e.target.value)} placeholder="Address" className="input-field"/>}
                    {isAbsenceTypeEditor && <input type="color" value={editColorValue || '#000000'} onChange={(e) => onEditColorChange(e.target.value)} className="h-8 w-full p-1 rounded-md bg-gray-50 dark:bg-blue-night-700 border dark:border-blue-night-600"/>}
                    {isSpecialDayTypeEditor && <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={editIsHoliday} onChange={(e) => onEditIsHolidayChange(e.target.checked)} className="rounded"/><span>Is Holiday</span></label>}
                </div>
            ) : (
                <div className="flex items-center flex-grow">
                    {colorIndicator && <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: colorIndicator }}></span>}
                    <div className="flex-grow">
                        <p className="font-medium">{text}</p>
                        {subtext && <p className="text-sm text-gray-500 dark:text-gray-400">{subtext}</p>}
                    </div>
                    <span className="ml-3 text-sm bg-gray-200 dark:bg-blue-night-950 px-2 py-0.5 rounded-full">{count} {countLabel}</span>
                </div>
            )}
             <div className="flex items-center space-x-2 pl-2">
                {isEditing ? (
                    <>
                        <button onClick={onSave} className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50"><Check size={18}/></button>
                        <button onClick={onCancel} className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"><X size={18}/></button>
                    </>
                ) : (
                    <>
                        <button onClick={onEdit} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-blue-night-700"><Edit size={16} /></button>
                        <button onClick={onDelete} className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 size={16} /></button>
                    </>
                )}
            </div>
        </div>
    )
}

export default Settings;