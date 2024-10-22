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
    const sortedLibraries = data.sort((a: any, b: any) => {
        return sortBy === 'asc'
            ? new Date(a[field]).getTime() - new Date(b[field]).getTime()
            : new Date(b[field]).getTime() - new Date(a[field]).getTime();
    });
    return sortedLibraries;
}