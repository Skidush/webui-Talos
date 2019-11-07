export class FieldFormat {
    static formatFieldValue(format: string, value: string) {
        switch (format) {
            case 'date':
            return this.formatDate(value);
            case 'dateTime':
            return this.formatDateTime(value);
            case 'time':
            return this.formatTime(value);
        }
    }

    private static formatDate(date) {
        let newDate = new Date(date);
        let year = newDate.getFullYear();
        let month:any = newDate.getMonth() + 1;
        let day:any = newDate.getDate();

        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;

        return `${year}-${month}-${day}`;
    }

    private static formatDateTime(date) {
        let newDate = new Date(date);
        let year = newDate.getFullYear();
        let month:any = newDate.getMonth() + 1;
        let day:any = newDate.getDate();
        let hours:any = newDate.getHours();
        let minutes:any = newDate.getMinutes();

        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    private static formatTime(timeString) {
        const hours = timeString.split(':')[0].trim();
        const minutes = timeString.split(':')[1].trim();

        const time = `${hours}:${minutes}`;

        return time;
    }
}