import React, { useState } from 'react';
import { Role, Employee, Location, Shift, Department, AbsenceType, Absence, SpecialDayType, SpecialDay } from '../types';
import { PlusCircle, Edit, Trash2, Users, MapPin, Briefcase, UserMinus, CalendarDays } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from './Modal';

// Props Interface
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

// #region Helper & Panel Components
const SettingsPanel: React.FC<{ title: string; description: string; buttonText: string; onAdd: () => void; children: React.ReactNode; }> = ({ title, description, buttonText, onAdd, children }) => (
    <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md animate-slide-in-up">
        <div className="flex justify-between items-start mb-4 pb-4 border-b dark:border-blue-night-800">
            <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
            <button onClick={onAdd} className="flex-shrink-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 dark:bg-blue-night-200 dark:text-blue-night-900 dark:hover:bg-blue-night-300">
                <PlusCircle size={20} className="mr-2" />
                {buttonText}
            </button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">{children}</div>
    </div>
);

const InfoListItem: React.FC<{ onEdit: () => void; onDelete: () => void; mainText: string; subText?: string; usageCount: number; usageLabel: string; colorIndicator?: string; }> = ({ onEdit, onDelete, mainText, subText, usageCount, usageLabel, colorIndicator }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-blue-night-800 rounded-lg group">
        <div className="flex items-center flex-grow truncate mr-4">
            {colorIndicator && <span className="w-4 h-4 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: colorIndicator }}></span>}
            <div className="truncate">
                <p className="font-medium truncate">{mainText}</p>
                {subText && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subText}</p>}
            </div>
        </div>
        <div className="flex items-center flex-shrink-0">
             <span className="mr-4 text-sm bg-gray-200 dark:bg-blue-night-950 px-2 py-0.5 rounded-full whitespace-nowrap">{usageCount} {usageLabel}</span>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-blue-night-700"><Edit size={16} /></button>
                <button onClick={onDelete} className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 size={16} /></button>
            </div>
        </div>
    </div>
);
// #endregion

// #region Settings Panels
const RoleSettingsPanel: React.FC<SettingsProps> = ({ roles, employees, onAddRole, onUpdateRole, onDeleteRole }) => {
    const { t } = useLanguage();
    const [modalState, setModalState] = useState<{ isOpen: boolean; role: Role | null }>({ isOpen: false, role: null });
    const [roleName, setRoleName] = useState('');

    const openModal = (role: Role | null = null) => { setModalState({ isOpen: true, role }); setRoleName(role ? role.name : ''); };
    const closeModal = () => setModalState({ isOpen: false, role: null });

    const handleSave = () => {
        if (!roleName.trim()) return;
        modalState.role ? onUpdateRole(modalState.role.id, roleName.trim()) : onAddRole(roleName.trim());
        closeModal();
    };
    const countEmployeesInRole = (roleName: string) => employees.filter(e => e.role === roleName).length;

    return (
        <SettingsPanel title={t('settings.manageRoles')} description={t('settings.rolesDescription')} buttonText={t('settings.addRole')} onAdd={() => openModal()}>
            {roles.map(role => (
                <InfoListItem key={role.id} mainText={role.name} usageCount={countEmployeesInRole(role.name)} usageLabel={t('settings.usersCount')} onEdit={() => openModal(role)} onDelete={() => { if (window.confirm(t('modals.confirmDeleteRole', { name: role.name }))) { onDeleteRole(role.id); }}} />
            ))}
            <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.role ? t('settings.editRole') : t('settings.addRole')}>
                <div className="space-y-4">
                    <label className="label-style">{t('settings.roleName')}</label>
                    <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder={t('settings.newRolePlaceholder')} className="input-field"/>
                    <div className="flex justify-end space-x-2 pt-2"><button onClick={closeModal} className="btn-secondary">{t('modals.cancel')}</button><button onClick={handleSave} className="btn-primary">{t('modals.save')}</button></div>
                </div>
            </Modal>
        </SettingsPanel>
    );
};

const LocationSettingsPanel: React.FC<SettingsProps> = ({ locations, shifts, onAddLocation, onUpdateLocation, onDeleteLocation }) => {
    const { t } = useLanguage();
    const [modalState, setModalState] = useState<{ isOpen: boolean; loc: Location | null }>({ isOpen: false, loc: null });
    const [locData, setLocData] = useState({ name: '', address: '' });

    const openModal = (loc: Location | null = null) => { setModalState({ isOpen: true, loc }); setLocData(loc ? { name: loc.name, address: loc.address || '' } : { name: '', address: '' }); };
    const closeModal = () => setModalState({ isOpen: false, loc: null });

    const handleSave = () => {
        if (!locData.name.trim()) return;
        modalState.loc ? onUpdateLocation(modalState.loc.id, locData.name.trim(), locData.address.trim()) : onAddLocation(locData.name.trim(), locData.address.trim());
        closeModal();
    };
    const countShiftsAtLocation = (locId: string) => shifts.filter(s => s.locationId === locId).length;

    return (
        <SettingsPanel title={t('settings.manageLocations')} description={t('settings.locationsDescription')} buttonText={t('settings.addLocation')} onAdd={() => openModal()}>
            {locations.map(loc => (
                <InfoListItem key={loc.id} mainText={loc.name} subText={loc.address} usageCount={countShiftsAtLocation(loc.id)} usageLabel={t('settings.shiftsCount')} onEdit={() => openModal(loc)} onDelete={() => { if (window.confirm(t('modals.confirmDeleteLocation', { name: loc.name }))) { onDeleteLocation(loc.id); }}} />
            ))}
            <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.loc ? t('settings.editLocation') : t('settings.addLocation')}>
                 <div className="space-y-4">
                    <div><label className="label-style">{t('settings.locationName')}</label><input type="text" value={locData.name} onChange={(e) => setLocData(d => ({ ...d, name: e.target.value }))} className="input-field"/></div>
                    <div><label className="label-style">{t('settings.locationAddress')}</label><input type="text" value={locData.address} onChange={(e) => setLocData(d => ({ ...d, address: e.target.value }))} className="input-field"/></div>
                    <div className="flex justify-end space-x-2 pt-2"><button onClick={closeModal} className="btn-secondary">{t('modals.cancel')}</button><button onClick={handleSave} className="btn-primary">{t('modals.save')}</button></div>
                </div>
            </Modal>
        </SettingsPanel>
    );
};

const DepartmentSettingsPanel: React.FC<SettingsProps> = ({ departments, shifts, onAddDepartment, onUpdateDepartment, onDeleteDepartment }) => {
    const { t } = useLanguage();
    const [modalState, setModalState] = useState<{ isOpen: boolean; dept: Department | null }>({ isOpen: false, dept: null });
    const [deptName, setDeptName] = useState('');

    const openModal = (dept: Department | null = null) => { setModalState({ isOpen: true, dept }); setDeptName(dept ? dept.name : ''); };
    const closeModal = () => setModalState({ isOpen: false, dept: null });

    const handleSave = () => {
        if (!deptName.trim()) return;
        modalState.dept ? onUpdateDepartment(modalState.dept.id, deptName.trim()) : onAddDepartment(deptName.trim());
        closeModal();
    };
    const countShiftsInDept = (deptId: string) => shifts.filter(s => s.departmentId === deptId).length;
    
    return (
        <SettingsPanel title={t('settings.manageDepartments')} description={t('settings.departmentsDescription')} buttonText={t('settings.addDepartment')} onAdd={() => openModal()}>
            {departments.map(dept => (
                <InfoListItem key={dept.id} mainText={dept.name} usageCount={countShiftsInDept(dept.id)} usageLabel={t('settings.shiftsCount')} onEdit={() => openModal(dept)} onDelete={() => { if (window.confirm(t('modals.confirmDeleteDepartment', { name: dept.name }))) { onDeleteDepartment(dept.id); }}} />
            ))}
            <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.dept ? t('settings.editDepartment') : t('settings.addDepartment')}>
                <div className="space-y-4">
                    <label className="label-style">{t('settings.departmentName')}</label>
                    <input type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} className="input-field"/>
                    <div className="flex justify-end space-x-2 pt-2"><button onClick={closeModal} className="btn-secondary">{t('modals.cancel')}</button><button onClick={handleSave} className="btn-primary">{t('modals.save')}</button></div>
                </div>
            </Modal>
        </SettingsPanel>
    );
};

const AbsenceSettingsPanel: React.FC<SettingsProps> = ({ absenceTypes, absences, onAddAbsenceType, onUpdateAbsenceType, onDeleteAbsenceType }) => {
    const { t } = useLanguage();
    const [modalState, setModalState] = useState<{ isOpen: boolean; at: AbsenceType | null }>({ isOpen: false, at: null });
    const [atData, setAtData] = useState({ name: '', color: '#f44336' });

    const openModal = (at: AbsenceType | null = null) => { setModalState({ isOpen: true, at }); setAtData(at ? { name: at.name, color: at.color } : { name: '', color: '#f44336' }); };
    const closeModal = () => setModalState({ isOpen: false, at: null });

    const handleSave = () => {
        if (!atData.name.trim()) return;
        modalState.at ? onUpdateAbsenceType(modalState.at.id, atData.name.trim(), atData.color) : onAddAbsenceType(atData.name.trim(), atData.color);
        closeModal();
    };
    const countAbsencesOfType = (typeId: string) => absences.filter(a => a.absenceTypeId === typeId).length;

    return (
        <SettingsPanel title={t('settings.manageAbsenceTypes')} description={t('settings.absenceTypesDescription')} buttonText={t('settings.addAbsenceType')} onAdd={() => openModal()}>
            {absenceTypes.map(at => (
                <InfoListItem key={at.id} mainText={at.name} usageCount={countAbsencesOfType(at.id)} usageLabel={t('settings.absencesCount')} colorIndicator={at.color} onEdit={() => openModal(at)} onDelete={() => { if (window.confirm(t('modals.confirmDeleteAbsenceType', { name: at.name }))) { onDeleteAbsenceType(at.id); }}} />
            ))}
            <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.at ? t('settings.editAbsenceType') : t('settings.addAbsenceType')}>
                <div className="space-y-4">
                    <div><label className="label-style">{t('settings.absenceTypeName')}</label><input type="text" value={atData.name} onChange={(e) => setAtData(d => ({ ...d, name: e.target.value }))} className="input-field"/></div>
                    <div><label className="label-style">{t('settings.absenceTypeColor')}</label><input type="color" value={atData.color} onChange={(e) => setAtData(d => ({ ...d, color: e.target.value }))} className="h-10 w-full p-1 rounded-md bg-gray-50 dark:bg-blue-night-700 border dark:border-blue-night-600"/></div>
                    <div className="flex justify-end space-x-2 pt-2"><button onClick={closeModal} className="btn-secondary">{t('modals.cancel')}</button><button onClick={handleSave} className="btn-primary">{t('modals.save')}</button></div>
                </div>
            </Modal>
        </SettingsPanel>
    );
};

const CalendarSettingsPanel: React.FC<SettingsProps> = ({ specialDayTypes, specialDays, onAddSpecialDayType, onUpdateSpecialDayType, onDeleteSpecialDayType }) => {
    const { t } = useLanguage();
    const [modalState, setModalState] = useState<{ isOpen: boolean; sdt: SpecialDayType | null }>({ isOpen: false, sdt: null });
    const [sdtData, setSdtData] = useState({ name: '', isHoliday: true });

    const openModal = (sdt: SpecialDayType | null = null) => { setModalState({ isOpen: true, sdt }); setSdtData(sdt ? { name: sdt.name, isHoliday: sdt.isHoliday } : { name: '', isHoliday: true }); };
    const closeModal = () => setModalState({ isOpen: false, sdt: null });

    const handleSave = () => {
        if (!sdtData.name.trim()) return;
        modalState.sdt ? onUpdateSpecialDayType(modalState.sdt.id, sdtData.name.trim(), sdtData.isHoliday) : onAddSpecialDayType(sdtData.name.trim(), sdtData.isHoliday);
        closeModal();
    };
    const countSpecialDaysOfType = (typeId: string) => specialDays.filter(sd => sd.typeId === typeId).length;

    return (
        <SettingsPanel title={t('settings.manageSpecialDayTypes')} description={t('settings.specialDayTypesDescription')} buttonText={t('settings.addSpecialDayType')} onAdd={() => openModal()}>
            {specialDayTypes.map(sdt => (
                <InfoListItem key={sdt.id} mainText={sdt.name} subText={sdt.isHoliday ? t('settings.holidayBlocking') : t('settings.eventNonBlocking')} usageCount={countSpecialDaysOfType(sdt.id)} usageLabel={t('settings.daysCount')} onEdit={() => openModal(sdt)} onDelete={() => { if (window.confirm(t('modals.confirmDeleteSpecialDayType', { name: sdt.name }))) { onDeleteSpecialDayType(sdt.id); }}} />
            ))}
            <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.sdt ? t('settings.editSpecialDayType') : t('settings.addSpecialDayType')}>
                <div className="space-y-4">
                    <div><label className="label-style">{t('settings.specialDayTypeName')}</label><input type="text" value={sdtData.name} onChange={(e) => setSdtData(d => ({...d, name: e.target.value}))} className="input-field"/></div>
                    <label className="flex items-center space-x-3 text-sm p-2 bg-gray-50 dark:bg-blue-night-800 rounded-md"><input type="checkbox" checked={sdtData.isHoliday} onChange={(e) => setSdtData(d => ({...d, isHoliday: e.target.checked}))} className="rounded w-4 h-4"/><span className="font-medium">{t('settings.blocksShifts')}</span></label>
                    <div className="flex justify-end space-x-2 pt-2"><button onClick={closeModal} className="btn-secondary">{t('modals.cancel')}</button><button onClick={handleSave} className="btn-primary">{t('modals.save')}</button></div>
                </div>
            </Modal>
        </SettingsPanel>
    );
};
// #endregion

// Main Settings Component
const Settings: React.FC<SettingsProps> = (props) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('roles');

    const navItems = [
        { id: 'roles', label: t('settings.roles'), icon: <Users size={20} /> },
        { id: 'locations', label: t('settings.locations'), icon: <MapPin size={20} /> },
        { id: 'departments', label: t('settings.departments'), icon: <Briefcase size={20} /> },
        { id: 'absences', label: t('settings.absences'), icon: <UserMinus size={20} /> },
        { id: 'calendar', label: t('settings.calendar'), icon: <CalendarDays size={20} /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'roles': return <RoleSettingsPanel {...props} />;
            case 'locations': return <LocationSettingsPanel {...props} />;
            case 'departments': return <DepartmentSettingsPanel {...props} />;
            case 'absences': return <AbsenceSettingsPanel {...props} />;
            case 'calendar': return <CalendarSettingsPanel {...props} />;
            default: return null;
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('settings.title')}</h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <aside className="w-full md:w-56 flex-shrink-0 bg-white dark:bg-blue-night-900 p-4 rounded-xl shadow-md">
                    <nav className="flex flex-row md:flex-col gap-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center p-3 rounded-lg text-sm font-semibold transition-colors duration-200 text-left ${activeTab === item.id ? 'bg-blue-600 text-white dark:bg-blue-night-200 dark:text-blue-night-900' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-blue-night-800'}`}
                            >
                                {item.icon}
                                <span className="ml-3 hidden md:inline">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-grow w-full">
                    {renderContent()}
                </main>
            </div>
            <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; }
                .dark .label-style { color: #D1D5DB; }
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #FFFFFF; color: #111827; }
                .dark .input-field { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
                .btn-primary { padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #2563EB; }
                .btn-primary:hover { background-color: #1D4ED8; }
                .btn-secondary { padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; }
                .dark .btn-secondary { color: #D1D5DB; background-color: #374151; }
                .btn-secondary:hover { background-color: #E5E7EB; }
                .dark .btn-secondary:hover { background-color: #4B5563; }
            `}</style>
        </div>
    );
};

export default Settings;
