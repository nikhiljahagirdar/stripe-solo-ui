import { Step } from './types';

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      {steps.map((step) => (
        <div key={step.id} className="flex flex-col items-center flex-1">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold mb-2 ${
              currentStep > step.id
                ? "bg-emerald-500 border-emerald-500 text-white"
                : currentStep === step.id
                ? "border-violet-500 text-violet-600"
                : "border-slate-300 text-slate-400"
            }`}
          >
            {currentStep > step.id ? "✓" : step.id}
          </div>
          <span className={currentStep === step.id ? "text-violet-600" : ""}>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
