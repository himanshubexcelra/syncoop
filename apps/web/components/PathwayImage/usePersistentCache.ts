import { useEffect, useState } from 'react';
import { saveToCache, loadFromCache } from './cacheStorage';

export const usePersistentCache = (key: string, initialValue: any) => {
    const [value, setValue] = useState<any>(null); // Start with null to check cache first

    // Load from cache on mount
    useEffect(() => {
        (async () => {
            const cachedData = await loadFromCache(key);

            if (cachedData !== null) {
                setValue(cachedData);
            } else {
                setValue(initialValue);
                await saveToCache(key, initialValue); // Ensure initial data gets stored
            }
        })();
    }, [key, initialValue]); // Depend on `initialValue` to update if it changes

    // Save to cache only if the new value differs
    const setCachedValue = async (newValue: any) => {
        if (JSON.stringify(value) !== JSON.stringify(newValue)) {
            setValue(newValue);
            await saveToCache(key, newValue);
        }
    };

    return [value, setCachedValue] as const;
};
