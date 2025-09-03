import React, { useState } from 'react';
import { Employee } from '../types';
import Modal from './Modal';
import { Upload, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type ImportableEmployee = Omit<Employee, 'id' | 'avatarUrl'>;

interface CSVImportModalProps {
    onClose: () => void;
    onImport: (employees: ImportableEmployee[]) => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ onClose, onImport }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [parsedData, setParsedData] = useState<ImportableEmployee[]>([]);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const REQUIRED_HEADERS = ['name', 'email', 'phone', 'gender', 'role'];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.trim().split(/\r\n|\n/);
                if (lines.length < 2) {
                    throw new Error("CSV file must contain a header row and at least one data row.");
                }

                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                
                const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
                if (missingHeaders.length > 0) {
                    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
                }

                const data: ImportableEmployee[] = [];
                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue; // Skip empty lines
                    const values = lines[i].split(',');
                    const entry: any = {};
                    headers.forEach((header, index) => {
                        if (REQUIRED_HEADERS.includes(header)) {
                             entry[header] = values[index]?.trim() || '';
                        }
                    });
                    
                    if (entry.name && entry.email) {
                        data.push({
                            name: entry.name,
                            email: entry.email,
                            phone: entry.phone || '',
                            gender: ['Male', 'Female', 'Other', 'Prefer not to say'].includes(entry.gender) ? entry.gender : 'Prefer not to say',
                            role: entry.role || 'Unassigned'
                        });
                    }
                }
                
                if (data.length === 0) {
                    throw new Error("No valid employee data found in the file. Make sure 'name' and 'email' columns are filled.");
                }

                setParsedData(data);
                setStep('preview');
            } catch (err: any) {
                setError(err.message);
                setStep('upload');
                setFileName('');
            }
        };

        reader.onerror = () => {
            setError("Failed to read the file.");
        };

        reader.readAsText(file);
    };

    const handleConfirmImport = () => {
        onImport(parsedData);
    };

    const handleReset = () => {
        setStep('upload');
        setParsedData([]);
        setFileName('');
        setError(null);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={t('modals.importEmployees')}>
            {step === 'upload' && (
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-night-800/50 rounded-lg border border-blue-200 dark:border-blue-night-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('modals.instructions')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('modals.importInstructions')}
                        </p>
                        <code className="mt-2 block text-xs bg-gray-200 dark:bg-blue-night-900 p-2 rounded-md">
                            name,email,phone,gender,role
                        </code>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                           {t('modals.importGenderHint')}
                        </p>
                    </div>
                    {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>}
                    <label
                        htmlFor="csv-upload"
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-night-800"
                    >
                        <Upload className="w-10 h-10 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {fileName ? t('modals.selectedFile', { fileName }) : t('modals.selectFile')}
                        </span>
                        <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
            )}
            {step === 'preview' && (
                <div className="space-y-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-300"
                           dangerouslySetInnerHTML={{ __html: t('modals.foundEmployees', { count: parsedData.length }) }}
                        >
                        </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto border dark:border-blue-night-700 rounded-md">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-100 dark:bg-blue-night-800">
                                <tr>
                                    <th className="p-2 text-left font-semibold">{t('modals.nameLabel')}</th>
                                    <th className="p-2 text-left font-semibold">{t('modals.emailLabel')}</th>
                                    <th className="p-2 text-left font-semibold">{t('modals.roleLabel')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((emp, index) => (
                                    <tr key={index} className="border-t dark:border-blue-night-700">
                                        <td className="p-2 truncate">{emp.name}</td>
                                        <td className="p-2 truncate">{emp.email}</td>
                                        <td className="p-2 truncate">{emp.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex justify-between items-center pt-4">
                        <button type="button" onClick={handleReset} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-blue-night-800 hover:bg-gray-200 dark:hover:bg-blue-night-700">
                            {t('modals.back')}
                        </button>
                        <button type="button" onClick={handleConfirmImport} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            {t('modals.confirmImport')}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CSVImportModal;