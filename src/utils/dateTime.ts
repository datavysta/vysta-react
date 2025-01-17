const padZero = (num: number): string => num.toString().padStart(2, '0');

export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    return `${year}-${month}-${day}`;
};

export const formatDateTime = (date: Date): string => {
    const datePart = formatDate(date);
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());
    return `${datePart}T${hours}:${minutes}:${seconds}`;
};

export const formatDateUS = (date: Date): string => {
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

export const formatDateTimeUS = (date: Date): string => {
    const datePart = formatDateUS(date);
    let hours = date.getHours();
    const minutes = padZero(date.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    return `${datePart} ${padZero(hours)}:${minutes} ${ampm}`;
};

export const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = padZero(date.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    return `${padZero(hours)}:${minutes} ${ampm}`;
};

export const parseDate = (value: string): Date => {
    return new Date(value);
};

export const parseDateTimeWithZone = (value: string): Date => {
    return new Date(value);
};

export const parseTimeWithBaseDate = (time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(1970, 0, 1);
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
};

export const toUTC = (date: Date): Date => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

export const fromUTC = (date: Date): Date => {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}; 