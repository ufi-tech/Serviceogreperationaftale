import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definerer ID'erne for de trin, vi vil spore validering for
export type StepId = 'bildata' | 'aftaleoverblik' | 'kundedata' | 'kontrakt';

// Typen for valideringsstatus for hvert trin
interface ValidationStatus {
  bildata: boolean;
  aftaleoverblik: boolean;
  kundedata: boolean;
  kontrakt: boolean;
}

// Typen for værdien, som vores context vil give
interface ValidationContextType {
  validationStatus: ValidationStatus;
  setStepValidated: (stepId: StepId, isValidated: boolean) => void;
  isStepAccessible: (stepId: StepId) => boolean; // Ny funktion
}

// Opretter context med en default værdi (som ikke bør bruges direkte)
const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

// Props for vores Provider komponent
interface ValidationProviderProps {
  children: ReactNode;
}

// Definerer rækkefølgen af trinene
const stepOrder: StepId[] = ['bildata', 'aftaleoverblik', 'kundedata', 'kontrakt'];

export const ValidationProvider: React.FC<ValidationProviderProps> = ({ children }) => {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    bildata: false,        // Start med at antage, at bildata ikke er valideret
    aftaleoverblik: false,
    kundedata: false,
    kontrakt: false,
  });

  const setStepValidated = (stepId: StepId, isValidated: boolean) => {
    setValidationStatus(prevStatus => ({
      ...prevStatus,
      [stepId]: isValidated,
    }));
  };

  // Funktion til at tjekke om et trin er tilgængeligt
  // Et trin er tilgængeligt, hvis alle foregående trin er valideret
  // Det første trin ('bildata') er altid tilgængeligt som udgangspunkt for flowet.
  const isStepAccessible = (stepId: StepId): boolean => {
    if (stepId === 'bildata') return true; // Bildata er altid startpunktet

    const stepIndex = stepOrder.indexOf(stepId);
    if (stepIndex === -1) return false; // Ukendt stepId

    // Tjek om alle foregående trin er validerede
    for (let i = 0; i < stepIndex; i++) {
      const previousStepId = stepOrder[i];
      if (!validationStatus[previousStepId]) {
        return false; // Et foregående trin er ikke valideret
      }
    }
    return true; // Alle foregående trin er valideret
  };

  return (
    <ValidationContext.Provider value={{ validationStatus, setStepValidated, isStepAccessible }}>
      {children}
    </ValidationContext.Provider>
  );
};

// Custom hook for nem adgang til context'en
export const useValidation = (): ValidationContextType => {
  const context = useContext(ValidationContext);
  if (context === undefined) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
};
