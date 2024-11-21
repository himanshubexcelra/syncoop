export const json = (param: any): any => {
    return JSON.stringify(
        param,
        (key, value) => (typeof value === "bigint" ? value.toString() : value)
    );
};

export const getUTCTime = (dateTimeString: string) => {
    const dt = new Date(dateTimeString);
    const dtNumber = dt.getTime();
    const dtOffset = dt.getTimezoneOffset() * 60000;
    const dtUTC = new Date();
    dtUTC.setTime(dtNumber - dtOffset);

    return dtUTC;
}