import React, { useState, useMemo } from 'react';
import { Employee, Role } from '../types';
import { PlusCircle, Edit, Trash2, Phone, LayoutGrid, List, Upload, Gem } from 'lucide-react';
import Avatar from './Avatar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface EmployeeCardProps {
    employee: Employee;
    onEdit: (employee: Employee) => void;
    onDelete: (employeeId: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => (
    <div 
        className="bg-white dark:bg-blue-night-900 p-4 rounded-xl shadow-md flex flex-col justify-between transition-transform hover:scale-105 duration-300 group cursor-pointer"
        onClick={() => onEdit(employee)}
    >
        <div className="text-center flex-grow">
            <div className="relative inline-block">
                 <Avatar name={employee.name} src={employee.avatarUrl} className="w-20 h-20 rounded-full border-2 border-blue-500 mx-auto" />
            </div>
            <h3 className="mt-2 text-lg font-bold text-gray-800 dark:text-white truncate">{employee.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{employee.email}</p>
             <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Phone size={12} className="mr-1.5" />
                <span>{employee.phone}</span>
            </div>
            <div className="mt-2 space-y-1">
              <span className="inline-block bg-blue-100 dark:bg-blue-night-800 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{employee.role}</span>
            </div>
        </div>
        <div className="mt-4 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity h-9">
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(employee); }} 
                className="p-2 rounded-full bg-gray-200 dark:bg-blue-night-800 hover:bg-gray-300 dark:hover:bg-blue-night-700">
                <Edit size={16} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(employee.id); }} 
                className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-600 dark:text-red-300">
                <Trash2 size={16} />
            </button>
        </div>
    </div>
);

interface EmployeeListProps {
    employees: Employee[];
    roles: Role[];
    onAdd: () => void;
    onEdit: (employee: Employee) => void;
    onDelete: (employeeId: string) => void;
    onImport: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, roles, onAdd, onEdit, onDelete, onImport }) => {
    const { permissions } = useAuth();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

    const atEmployeeLimit = employees.length >= permissions.employeeLimit;

    const handleDeleteWithConfirm = (employeeId: string) => {
        const employee = employees.find(e => e.id === employeeId);
        if(employee && window.confirm(t('modals.confirmDelete', { name: employee.name }))){
            onDelete(employeeId);
        }
    }

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const nameMatch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
            const roleMatch = roleFilter === 'all' || employee.role === roleFilter;
            const genderMatch = genderFilter === 'all' || employee.gender === genderFilter;
            return nameMatch && roleMatch && genderMatch;
        });
    }, [employees, searchTerm, roleFilter, genderFilter]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('employees.title')}</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-gray-200 dark:bg-blue-night-800 rounded-lg p-1">
                        <button
                            onClick={() => setDisplayMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${displayMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-gray-400'}`}
                            aria-label={t('employees.gridView')}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setDisplayMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-gray-400'}`}
                            aria-label={t('employees.listView')}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <button 
                        onClick={() => permissions.canImportEmployees && onImport()}
                        disabled={!permissions.canImportEmployees}
                        title={!permissions.canImportEmployees ? t('tooltips.proFeature') : ''}
                        className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 relative ${!permissions.canImportEmployees ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {!permissions.canImportEmployees && <Gem size={14} className="absolute -top-1 -right-1 text-yellow-400" />}
                        <Upload size={20} className="mr-2" />
                        {t('employees.importCSV')}
                    </button>
                    <button 
                        onClick={onAdd} 
                        disabled={atEmployeeLimit}
                        title={atEmployeeLimit ? t('tooltips.employeeLimit', { limit: permissions.employeeLimit }) : ''}
                        className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${atEmployeeLimit ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <PlusCircle size={20} className="mr-2" />
                        {t('employees.addEmployee')}
                    </button>
                </div>
            </div>
             {/* Filter and Search Bar */}
            <div className="mb-6 p-4 bg-white dark:bg-blue-night-900 rounded-xl shadow-md flex flex-col gap-4 items-center">
                <div className="w-full">
                    <input 
                        type="text"
                        placeholder={t('employees.searchByName')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-blue-night-800 dark:border-blue-night-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-blue-night-800 dark:border-blue-night-700">
                        <option value="all">{t('employees.allRoles')}</option>
                        {roles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                    </select>
                    <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-blue-night-800 dark:border-blue-night-700">
                        <option value="all">{t('employees.allGenders')}</option>
                        <option value="Male">{t('gender.male')}</option>
                        <option value="Female">{t('gender.female')}</option>
                        <option value="Other">{t('gender.other')}</option>
                        <option value="Prefer not to say">{t('gender.preferNotToSay')}</option>
                    </select>
                </div>
            </div>

            {filteredEmployees.length === 0 ? (
                 <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">{t('employees.noEmployeesFound')}</p>
                </div>
            ) : displayMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredEmployees.map(employee => (
                        <EmployeeCard 
                            key={employee.id} 
                            employee={employee} 
                            onEdit={onEdit} 
                            onDelete={handleDeleteWithConfirm} 
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-blue-night-900 rounded-xl shadow-md overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-blue-night-800 text-xs uppercase text-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('employees.tableHeaderEmployee')}</th>
                                <th scope="col" className="px-6 py-3">{t('employees.tableHeaderContact')}</th>
                                <th scope="col" className="px-6 py-3">{t('employees.tableHeaderRole')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('employees.tableHeaderActions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(employee => (
                                <tr 
                                    key={employee.id} 
                                    className="border-b dark:border-blue-night-700 hover:bg-gray-50 dark:hover:bg-blue-night-800/50 cursor-pointer"
                                    onClick={() => onEdit(employee)}
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Avatar name={employee.name} src={employee.avatarUrl} className="w-10 h-10 rounded-full mr-3 flex-shrink-0" />
                                            {employee.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="truncate">{employee.email}</div>
                                        <div className="text-gray-500 dark:text-gray-400">{employee.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block bg-blue-100 dark:bg-blue-night-800 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{employee.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div 
                                            className="flex justify-end space-x-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button onClick={() => onEdit(employee)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-blue-night-700">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteWithConfirm(employee.id)} className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;