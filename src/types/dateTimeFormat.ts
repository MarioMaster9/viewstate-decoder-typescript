import { DateTime } from "./datetime"
const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');
class DateTimeFormat {
    public static Format(dateTime: DateTime, format?: string) {
        let hours = dateTime.Hour % 12;
        if (hours == 0) {
            hours = 12;
        }
        let valueString: string;
        if (dateTime.Hour >= 12) {
            valueString = `${dateTime.Month}/${dateTime.Day}/${zeroPad(dateTime.Year, 4)} ${hours}:${zeroPad(dateTime.Minute, 2)}:${zeroPad(dateTime.Second, 2)} PM`;
        } else {
            valueString = `${dateTime.Month}/${dateTime.Day}/${zeroPad(dateTime.Year, 4)} ${hours}:${zeroPad(dateTime.Minute, 2)}:${zeroPad(dateTime.Second, 2)} PM`;
        }
        return `${dateTime.Month}/${dateTime.Day}/${zeroPad(dateTime.Year, 4)} ${hours}:${zeroPad(dateTime.Minute, 2)}:${zeroPad(dateTime.Second, 2)} PM`;
    } 
}

export {DateTimeFormat}