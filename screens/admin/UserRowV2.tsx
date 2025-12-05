import React from 'react';
import { Ban } from 'lucide-react';
import { Employee } from '../../types';

// --- SWITCH COMPONENT ---
const SwitchV2 = ({ checked, onChange, disabled }: { checked: boolean; onChange: (e: React.MouseEvent) => void; disabled?: boolean }) => (
    <div
        role="button"
        onClick={onChange}
        className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none 
            ${checked ? 'bg-green-500' : 'bg-slate-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
    >
        <span
            className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                transition duration-200 ease-in-out
                ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
        />
    </div>
);

// --- USER ROW V2 (IRON GRID LAYOUT) ---
interface UserRowV2Props {
    employee: Employee;
    isSelected: boolean;
    onSelect: () => void;
    onToggleStatus: (e: React.MouseEvent, employee: Employee) => void;
}

export const UserRowV2 = ({ employee, isSelected, onSelect, onToggleStatus }: UserRowV2Props) => {
    const isUserActive = employee.isActive !== false;

    return (
        <div
            onClick={onSelect}
            className={`
                grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4 border-b border-slate-100 
                transition-all duration-200 cursor-pointer
                ${isSelected
                    ? 'bg-blue-50/80 border-blue-200'
                    : 'bg-white/60 hover:bg-white'
                }
                backdrop-blur-sm
            `}
        >
            {/* COL 1: AVATAR (Fixed Auto) */}
            <div className="relative shrink-0 flex items-center justify-center">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 flex-none ${isUserActive ? 'border-white shadow-sm' : 'border-slate-200 grayscale'}`}>
                    <img
                        src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=random`}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                {!isUserActive && (
                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-0.5 rounded-full ring-2 ring-white">
                        <Ban size={10} />
                    </div>
                )}
            </div>

            {/* COL 2: INFO (1fr - Takes remaining space) - CRITICAL: min-w-0 */}
            <div className="min-w-0 flex flex-col justify-center">
                <h3 className={`text-base font-bold tracking-tight truncate ${isUserActive ? 'text-slate-800' : 'text-slate-500 decoration-slate-400 line-through'}`}>
                    {employee.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold shrink-0">
                        {employee.id}
                    </span>
                    <span className="truncate">
                        {employee.department}
                    </span>
                </div>
            </div>

            {/* COL 3: ACTION (Fixed Auto) - RED BORDER DEBUG */}
            <div className="shrink-0 flex items-center justify-end border-2 border-red-500 p-1 border-dashed">
                <SwitchV2
                    checked={isUserActive}
                    onChange={(e) => onToggleStatus(e, employee)}
                />
            </div>
        </div>
    );
};
