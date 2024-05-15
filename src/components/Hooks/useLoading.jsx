import React, { createContext, useState, useContext } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const startLoading = (message = '') => {
        setLoadingMessage(message);
        setLoading(true);
    };

    const stopLoading = () => {
        setTimeout(() => {
            setLoading(false);
            setLoadingMessage('');
        }, 1000); // délai minimum de 2 secondes
    };

    return (
        <LoadingContext.Provider value={{ loading, loadingMessage, startLoading, stopLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
