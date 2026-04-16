import React from 'react';
import { MapPin, Sparkles, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatusStepBar = ({ currentStep }) => {
    const { t } = useTranslation();
    const steps = [
        { id: 1, label: t('survey.status.step1'), icon: MapPin },
        { id: 2, label: t('survey.status.step2'), icon: Settings2 },
        { id: 3, label: t('survey.status.step3'), icon: Sparkles },
    ];

    return (
        <div className="w-full py-6 px-4 mb-8">
            <div className="max-w-3xl mx-auto flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
                
                {/* Active Progress Line */}
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep >= step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div 
                                className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                                    ${isActive ? 'bg-primary text-secondary shadow-lg shadow-primary/20 scale-110' : 'bg-white text-gray-300 border-2 border-gray-100'}
                                    ${isCurrent ? 'ring-4 ring-primary/20 animate-pulse' : ''}
                                `}
                            >
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                            <span 
                                className={`
                                    absolute -bottom-8 whitespace-nowrap text-xs font-bold tracking-tight transition-all duration-500
                                    ${isActive ? 'text-secondary opacity-100' : 'text-gray-400 opacity-60'}
                                    ${isCurrent ? 'scale-105' : ''}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusStepBar;
