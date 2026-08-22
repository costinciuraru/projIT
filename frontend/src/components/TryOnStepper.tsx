import { Check } from "lucide-react";

const STEPS = ["Upload Photo", "Select Item", "Try On", "Download"];

interface TryOnStepperProps {
  currentStep: number;
}

function TryOnStepper({ currentStep }: TryOnStepperProps) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                  isCompleted
                    ? "bg-accent text-white"
                    : isActive
                      ? "bg-accent/10 text-accent ring-2 ring-accent"
                      : "bg-cream text-ink/40"
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={2} /> : index + 1}
              </div>
              <span
                className={`whitespace-nowrap text-xs font-medium ${
                  isActive || isCompleted ? "text-ink" : "text-ink/40"
                }`}
              >
                {step}
              </span>
            </div>

            {!isLast && (
              <div
                className={`mx-3 mb-5 h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  isCompleted ? "bg-accent" : "bg-cream"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TryOnStepper;
