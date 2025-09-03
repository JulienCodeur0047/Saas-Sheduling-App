import React from 'react';
import { Shift, Employee, Location, Department } from '../types';
import Avatar from './Avatar';
import { Trash2, MapPin, Briefcase, UserPlus } from 'lucide-react';

interface ShiftCardProps {
    shift: Shift;
    employee?: Employee;
    location?: Location;
    department?: Department;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, shiftId: string) => void;
    onClick: () => void;
    onDelete: (shiftId: string) => void;
    isSelectionModeActive: boolean;
    isSelected: boolean;
    onToggleSelect: (shiftId: string) => void;
}

const roleColors: { [key: string]: string } = {
    'Manager': 'border-red-500',
    'Cashier': 'border-green-500',
    'Stocker': 'border-blue-500',
    'Clerk': 'border-yellow-500',
};

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, employee, location, department, onDragStart, onClick, onDelete, isSelectionModeActive, isSelected, onToggleSelect }) => {

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent onClick from firing
        if (window.confirm('Are you sure you want to delete this shift?')) {
            onDelete(shift.id);
        }
    };
    
    const handleCardClick = (e: React.MouseEvent) => {
        if (isSelectionModeActive && employee) { // Selection mode only for assigned shifts
            onToggleSelect(shift.id)
        } else {
            onClick();
        }
    }
    
    // Open Shift Card variant
    if (!employee) {
        return (
             <div
                onClick={handleCardClick}
                className={`p-3 rounded-lg mb-2 cursor-pointer border-l-4 border-dashed border-gray-400 dark:border-gray-500 group relative bg-gray-100 dark:bg-blue-night-900/70 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1`}
             >
                <div className="flex items-center mb-1">
                    <div className="w-6 h-6 rounded-full mr-2 bg-gray-300 dark:bg-blue-night-700 flex items-center justify-center flex-shrink-0">
                        <UserPlus size={14} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-200 truncate">Open Shift</p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mb-2">
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </p>
                <div className="space-y-1">
                    {location && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <MapPin size={12} className="mr-1.5 flex-shrink-0" />
                            <span className="truncate">{location.name}</span>
                        </div>
                    )}
                    {department && (
                         <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Briefcase size={12} className="mr-1.5 flex-shrink-0" />
                            <span className="truncate">{department.name}</span>
                        </div>
                    )}
                </div>
                 <button 
                    onClick={handleDeleteClick}
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-full bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-600 dark:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete shift"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        );
    }
    
    // Assigned Shift Card (original component)
    const colorClass = roleColors[employee.role] || 'border-gray-500';

    return (
        <div
            draggable={!isSelectionModeActive}
            onDragStart={(e) => onDragStart(e, shift.id)}
            onClick={handleCardClick}
            className={`p-3 rounded-lg mb-2 cursor-pointer border-l-4 group relative ${colorClass} ${isSelected ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-blue-night-800'} shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1`}
        >
            {isSelectionModeActive && (
                <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(shift.id)}
                    className="absolute top-2 right-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                />
            )}
            <div className="flex items-center mb-1">
                <Avatar name={employee.name} src={employee.avatarUrl} className="w-6 h-6 rounded-full mr-2"/>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{employee.name}</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mb-2">
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
            </p>
            <div className="space-y-1">
                {location && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={12} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">{location.name}</span>
                    </div>
                )}
                {department && (
                     <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Briefcase size={12} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">{department.name}</span>
                    </div>
                )}
            </div>
            {!isSelectionModeActive && (
                 <button 
                    onClick={handleDeleteClick}
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-full bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-600 dark:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete shift"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
};

export default ShiftCard;