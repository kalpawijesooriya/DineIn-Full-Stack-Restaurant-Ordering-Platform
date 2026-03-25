import { formatCurrency } from '@/hooks/useFormatCurrency';
import type { CustomizationGroup as MenuCustomizationGroup } from '@/types';

interface CustomizationGroupProps {
  group: MenuCustomizationGroup;
  selectedOptions: string[];
  onSelectionChange: (optionId: string, selected: boolean) => void;
  showError?: boolean;
}

export function CustomizationGroup({
  group,
  selectedOptions,
  onSelectionChange,
  showError = false,
}: CustomizationGroupProps) {
  const hasSelection = selectedOptions.length > 0;
  const hasValidationError = group.required && showError && !hasSelection;
  const useRadio = group.maxSelections === 1 && group.required;
  const maxReached = group.maxSelections > 0 && selectedOptions.length >= group.maxSelections;

  return (
    <section className={`rounded-2xl border bg-white p-4 ${hasValidationError ? 'border-red-500' : 'border-slate-200'}`}>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{group.name}</h3>
        {group.required ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Required</span>
        ) : null}
      </header>

      <div className="space-y-2">
        {group.options.map((option) => {
          const isChecked = selectedOptions.includes(option.id);
          const disabled = !isChecked && maxReached;
          const inputType = useRadio ? 'radio' : 'checkbox';

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 transition ${
                isChecked ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
              } ${disabled ? 'cursor-not-allowed opacity-55' : 'hover:border-primary/50'}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type={inputType}
                  name={useRadio ? group.id : `${group.id}-${option.id}`}
                  checked={isChecked}
                  disabled={disabled}
                  onChange={(event) => onSelectionChange(option.id, event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm font-medium text-slate-800">{option.name}</span>
              </div>
              {option.priceAdjustment > 0 ? (
                <span className="text-sm font-semibold text-slate-700">+{formatCurrency(option.priceAdjustment)}</span>
              ) : null}
            </label>
          );
        })}
      </div>

      {hasValidationError ? <p className="mt-2 text-sm font-medium text-red-600">Please select an option</p> : null}
    </section>
  );
}
