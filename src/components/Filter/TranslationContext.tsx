import React, { createContext, useContext } from 'react';

export interface TranslationService {
    t: (key: string) => string;
    i18n?: Record<string, unknown>;
    tReady?: boolean;
}

const defaultTranslation: TranslationService = {
    t: (key: string) => key,
    tReady: true
};

export const TranslationContext = createContext<TranslationService>(defaultTranslation);

export const useTranslationContext = () => useContext(TranslationContext);

export const TranslationProvider: React.FC<{
    service?: TranslationService;
    children: React.ReactNode;
}> = ({ service = defaultTranslation, children }) => (
    <TranslationContext.Provider value={service}>
        {children}
    </TranslationContext.Provider>
);  