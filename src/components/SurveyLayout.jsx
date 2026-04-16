import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProgressBar from './ProgressBar';
import Button from './Button';

const SurveyLayout = ({
    step,
    totalSteps,
    title,
    subtitle,
    children,
    onNext,
    onBack,
    canNext = true,
    nextLabel
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const displayNextLabel = nextLabel || t('survey.nextStep');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Fixed header */}
            <div className="sticky top-0 z-20 bg-background pt-10 pb-4 px-6 shadow-sm">
                <ProgressBar current={step} total={totalSteps} />

                <div className="mt-4">
                    <button
                        onClick={onBack || (() => navigate(-1))}
                        className="p-2 -ml-2 text-gray-400 hover:text-secondary mb-2"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <span className="text-primary font-bold text-base tracking-widest uppercase">
                        {t('survey.stepOf', { current: step, total: totalSteps })}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-secondary mt-2 leading-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-gray-500 mt-2 text-lg font-medium">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-grow px-6 py-6 overflow-y-auto pb-32">
                {children}
            </div>

            {/* Fixed bottom CTA */}
            <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
                <Button
                    fullWidth
                    onClick={onNext}
                    disabled={!canNext}
                    className={`w-full text-lg py-4 ${!canNext ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {displayNextLabel}
                </Button>
            </div>
        </div>
    );
};

export default SurveyLayout;
