import React from 'react';

interface WizardProgressBarProps {
  currentStep: 'services' | 'consultants' | 'times' | 'confirm' | 'success';
}

const WizardProgressBar: React.FC<WizardProgressBarProps> = ({ currentStep }) => {
  const steps = ['services', 'consultants', 'times', 'confirm'];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center space-x-4 mb-6">
      {steps.map((stepName, index) => (
        <div key={stepName} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
              currentStep === stepName
                ? 'bg-blue-600 text-white'
                : currentIndex > index
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index + 1}
          </div>
          {index < 3 && <div className="w-12 h-1 bg-gray-200 mx-2" />}
        </div>
      ))}
    </div>
  );
};

export default WizardProgressBar;