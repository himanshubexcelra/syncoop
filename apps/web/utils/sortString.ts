export function sortString(data: any, field: string, sortBy: string): any {
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
}