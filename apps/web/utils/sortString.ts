/*eslint max-len: ["error", { "code": 100 }]*/

export function sortStringJoined(data: any, field: string, sortBy: string, joined: string): any {
    if (sortBy === 'asc')
        data.sort((a: any, b: any) => {
            const fieldA = a[field] + a[joined];
            const fieldB = b[field] + b[joined];
            if (fieldA < fieldB) return -1;
            if (fieldA > fieldB) return 1;
            return 0;
        });
    else
        data.sort((a: any, b: any) => {
            const fieldA = a[field] + a[joined];
            const fieldB = b[field] + b[joined];
            if (fieldA > fieldB) return -1;
            if (fieldA < fieldB) return 1;
            return 0;
        });
    return data;
}
export function sortString(data: any, field: string, sortBy: string, object?: boolean): any {
    if (!object) {
        if (sortBy === 'asc')
            data.sort((a: any, b: any) => {
                if (a[field] < b[field]) return -1;
                if (a[field] > b[field]) return 1;
                return 0;
            });
        else
            data.sort((a: any, b: any) => {
                if (a[field] > b[field]) return -1;
                if (a[field] < b[field]) return 1;
                return 0;
            });
        return data;
    } else {
        data.sort((a: any, b: any) => {
            const getValue = (obj: any, path: string) => {
                return path.split('.').reduce((acc, key) => acc && acc[key], obj);
            };

            const aValue = getValue(a, field);
            const bValue = getValue(b, field);

            if (sortBy === 'asc') {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
            } else if (sortBy === 'desc') {
                if (aValue < bValue) return 1;
                if (aValue > bValue) return -1;
            }

            return 0;
        });
        return data;
    }
}

export function sortByDate(data: any, field: string, sortBy: string): any[] {
    const sortedLibraries = data?.sort((a: any, b: any) => {
        return sortBy === 'asc'
            ? new Date(a[field]).getTime() - new Date(b[field]).getTime()
            : new Date(b[field]).getTime() - new Date(a[field]).getTime();
    });
    return sortedLibraries;
}

export function sortNumber(data: any, field: string, sortBy: string): any[] {
    const sortedLibraries = data.sort((a: any, b: any) => {
        return sortBy === 'asc'
            ? a[field].length - b[field].length
            : b[field].length - a[field].length;
    });
    return sortedLibraries;
}