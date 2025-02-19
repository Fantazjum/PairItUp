
export class DateUtils {
    public static getExpirationDate(): Date {
        const today = new Date();
        const expirationDate = new Date(today.valueOf());
        expirationDate.setDate(expirationDate.getDate() + 1);

        return expirationDate;
    }
}
