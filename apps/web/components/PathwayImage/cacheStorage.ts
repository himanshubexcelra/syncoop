const CACHE_NAME = 'pathway-cache-v1';

// Save data to Cache Storage
export async function saveToCache(key: string, value: any) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const request = new Request(key);

        const existingResponse = await cache.match(request);
        if (existingResponse) {
            const existingData = await existingResponse.json();
            if (JSON.stringify(existingData) === JSON.stringify(value)) {
                return;
            }
        }

        const response = new Response(JSON.stringify(value), {
            headers: { 'Content-Type': 'application/json' },
        });

        await cache.put(request, response);
    } catch (error) {
        console.error(`[Cache Error] Failed to save key: ${key}`, error);
    }
}

// Load data from Cache Storage
export async function loadFromCache(key: string): Promise<any | null> {
    try {
        const cache = await caches.open(CACHE_NAME);
        const request = new Request(key);

        const cachedResponse = await cache.match(request);
        if (!cachedResponse || !cachedResponse.ok) {
            return null;
        }

        const data = await cachedResponse.json();
        return data;
    } catch (error) {
        console.error(`[Cache Error] Failed to load key: ${key}`, error);
        return null;
    }
}
