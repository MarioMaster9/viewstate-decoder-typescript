import { LocalizationList } from "../localization";

export {LocalizationList} from "../localization"
// ==++==
//
//   Copyright (c) Microsoft Corporation.  All rights reserved.
//
// ==--==

const TicksPerMillisecond: bigint = 10000n;
const TicksPerSecond: bigint = TicksPerMillisecond * 1000n;
const TicksPerMinute: bigint = TicksPerSecond * 60n;
const TicksPerHour: bigint = TicksPerMinute * 60n;
const TicksPerDay: bigint = TicksPerHour * 24n;

// Number of milliseconds per time unit
const MillisPerSecond: number = 1000;
const MillisPerMinute: number = MillisPerSecond * 60;
const MillisPerHour: number = MillisPerMinute * 60;
const MillisPerDay: number = MillisPerHour * 24;

// Number of days in a non-leap year
const DaysPerYear: number = 365;
// Number of days in 4 years
const DaysPer4Years: number = DaysPerYear * 4 + 1;       // 1461
// Number of days in 100 years
const DaysPer100Years: number = DaysPer4Years * 25 - 1;  // 36524
// Number of days in 400 years
const DaysPer400Years: number = DaysPer100Years * 4 + 1; // 146097

// Number of days from 1/1/0001 to 12/31/1600
const DaysTo1601: number = DaysPer400Years * 4;          // 584388
// Number of days from 1/1/0001 to 12/30/1899
const DaysTo1899: number = DaysPer400Years * 4 + DaysPer100Years * 3 - 367;
// Number of days from 1/1/0001 to 12/31/1969
const DaysTo1970: number = DaysPer400Years * 4 + DaysPer100Years * 3 + DaysPer4Years * 17 + DaysPerYear; // 719,162
// Number of days from 1/1/0001 to 12/31/9999
const DaysTo10000: number = DaysPer400Years * 25 - 366;  // 3652059

const MinTicks: bigint = 0n;
const MaxTicks: bigint = BigInt(DaysTo10000) * TicksPerDay - 1n;
const MaxMillis: bigint = BigInt(DaysTo10000) * BigInt(MillisPerDay);

const FileTimeOffset: bigint = BigInt(DaysTo1601) * TicksPerDay;
const DoubleDateOffset: bigint = BigInt(DaysTo1899) * TicksPerDay;
// The minimum OA date is 0100/01/01 (Note it's year 100).
// The maximum OA date is 9999/12/31
const OADateMinAsTicks: bigint = BigInt(DaysPer100Years - DaysPerYear) * TicksPerDay;
// All OA dates must be greater than (not >=) OADateMinAsDouble
const OADateMinAsDouble: number = -657435.0;
// All OA dates must be less than (not <=) OADateMaxAsDouble
const OADateMaxAsDouble: number = 2958466.0;

const DatePartYear: number = 0;
const DatePartDayOfYear: number = 1;
const DatePartMonth: number = 2;
const DatePartDay: number = 3;

const s_isLeapSecondsSupportedSystem: boolean = true;

const DaysToMonth365: number[] = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
const DaysToMonth366: number[] = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

const TicksMask: bigint             = 0x3FFFFFFFFFFFFFFFn;
const FlagsMask: bigint             = 0xC000000000000000n;
const LocalMask: bigint             = 0x8000000000000000n;
const TicksCeiling: bigint           = 0x4000000000000000n; // signed
const KindUnspecified: bigint       = 0x4000000000000000n;
const KindUtc: bigint               = 0x4000000000000000n;
const KindLocal: bigint             = 0x8000000000000000n;
const KindLocalAmbiguousDst: bigint = 0xC000000000000000n;
const KindShift: number = 62;

enum DateTimeKind {
    Unspecified,
    Utc,
    Local
}

class DateTime {
    static MinValue: DateTime = new DateTime(MinTicks, DateTimeKind.Unspecified);
    static MaxValue: DateTime = new DateTime(MaxTicks, DateTimeKind.Unspecified);
    // The data is stored as an unsigned 64-bit integer
    //   Bits 01-62: The value of 100-nanosecond ticks where 0 represents 1/1/0001 12:00am, up until the value
    //               12/31/9999 23:59:59.9999999
    //   Bits 63-64: A four-state value that describes the DateTimeKind value of the date time, with a 2nd
    //               value for the rare case where the date time is local, but is in an overlapped daylight
    //               savings time hour and it is in daylight savings time. This allows distinction of these
    //               otherwise ambiguous local times and prevents data loss when round tripping from Local to
    //               UTC time.
    private dateData: bigint;
    
    constructor(dateData: bigint);
    constructor(ticks: bigint, kind: DateTimeKind);
    constructor(ticks: bigint, kind: DateTimeKind, isAmbiguousDst: boolean);
    constructor(year: number, month: number, day: number);
    //constructor(year: number, month: number, day: number, calendar: Calendar);
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number);
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number, kind: DateTimeKind);
    //constructor(year: number, month: number, day: number, hour: number, minute: number, second: number, calendar: Calendar);
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number);
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number, kind: DateTimeKind);
    //constructor(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number, calendar: Calendar);
    //constructor(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number, calendar: Calendar, kind: DateTimeKind);
    constructor(
        dateDataOrTicksOrYear: bigint | number,
        kindOrMonth?: DateTimeKind | number,
        isAmbiguousDstOrDay?: boolean | number,
        hour?: number,
        minute?: number,
        second?: number,
        kindOrMillisecond?: DateTimeKind | number,
    ) {
        if (typeof(dateDataOrTicksOrYear) == 'bigint') {
            if (kindOrMonth != null) {
                let ticks: bigint = dateDataOrTicksOrYear;
                let kind: DateTimeKind = kindOrMonth;
                if (isAmbiguousDstOrDay != null) {
                    let isAmbiguousDst: boolean = isAmbiguousDstOrDay as boolean;
                    if (ticks < MinTicks || ticks > MaxTicks)
                        throw new RangeError(LocalizationList.ArgumentOutOfRange_DateTimeBadTicks);
                    this.dateData = ticks | (isAmbiguousDst ? KindLocalAmbiguousDst : KindLocal);
                } else {
                    this.dateData = ticks | (BigInt(kind) << BigInt(KindShift));
                }
            } else {
                let ticks: bigint = dateDataOrTicksOrYear;
                this.dateData = ticks;
            }
        } else {
            let year: number = dateDataOrTicksOrYear;
            let month: number = kindOrMonth;
            let day: number = isAmbiguousDstOrDay as number;
            if (hour != null) {
                // can't do DateTimeKind right now
                if (kindOrMillisecond != null) {
                    let millisecond: number = kindOrMillisecond;
                    if (millisecond < 0 || millisecond >= MillisPerSecond)
                        throw new RangeError("millisecond should be between 0 and " + (MillisPerSecond - 1));
                    if (second == 60 && s_isLeapSecondsSupportedSystem && DateTime.IsValidTimeWithLeapSeconds(year, month, day, hour, minute, second, DateTimeKind.Unspecified)) {
                        // if we have leap second (second = 60) then we'll need to check if it is valid time.
                        // if it is valid, then we adjust the second to 59 so DateTime will consider this second is last second
                        // in the specified minute.
                        // if it is not valid time, we'll eventually throw.
                        second = 59;
                    }

                    let ticks: bigint = DateTime.DateToTicks(year, month, day) + DateTime.TimeToTicks(hour, minute, second);
                    ticks += BigInt(millisecond) * TicksPerMillisecond;
                    if (ticks < MinTicks || ticks > MaxTicks)
                        throw new Error("Date out of range");
                    this.dateData = ticks; // signed to unsigned
                } else {
                    if (second == 60 && s_isLeapSecondsSupportedSystem && DateTime.IsValidTimeWithLeapSeconds(year, month, day, hour, minute, second, DateTimeKind.Unspecified)) {
                        // if we have leap second (second = 60) then we'll need to check if it is valid time.
                        // if it is valid, then we adjust the second to 59 so DateTime will consider this second is last second
                        // in the specified minute.
                        // if it is not valid time, we'll eventually throw.
                        second = 59;
                    }
                    this.dateData = (DateTime.DateToTicks(year, month, day) + DateTime.TimeToTicks(hour, minute, second));
                }
            }
        }
    }
    
    private get InternalTicks(): bigint {
        return this.dateData & TicksMask;
    }

    private get InternalKind(): bigint {
        return this.dateData & FlagsMask;
    }

    // Returns the DateTime resulting from adding the given
    // TimeSpan to this DateTime.
    //
    //public Add(value: TimeSpan)

    // Returns the DateTime resulting from adding a fractional number of
    // time units to this DateTime.
    private Add(value: number, scale: number): DateTime {
        let millis: bigint = BigInt(value * scale + (value >= 0? 0.5: -0.5));
        if (millis <= -MaxMillis || millis >= MaxMillis)
            throw new RangeError("value is out of range");
        return this.AddTicks(millis * TicksPerMillisecond);
    }

    // Returns the DateTime resulting from adding a fractional number of
    // days to this DateTime. The result is computed by rounding the
    // fractional number of days given by value to the nearest
    // millisecond, and adding that interval to this DateTime. The
    // value argument is permitted to be negative.
    //
    public AddDays(value: number): DateTime {
        return this.Add(value, MillisPerDay);
    }

    // Returns the DateTime resulting from adding a fractional number of
    // hours to this DateTime. The result is computed by rounding the
    // fractional number of hours given by value to the nearest
    // millisecond, and adding that interval to this DateTime. The
    // value argument is permitted to be negative.
    //
    public AddHours(value: number): DateTime {
        return this.Add(value, MillisPerHour);
    }

    // Returns the DateTime resulting from the given number of
    // milliseconds to this DateTime. The result is computed by rounding
    // the number of milliseconds given by value to the nearest integer,
    // and adding that interval to this DateTime. The value
    // argument is permitted to be negative.
    //
    public AddMilliseconds(value: number): DateTime {
        return this.Add(value, 1);
    }

    // Returns the DateTime resulting from adding a fractional number of
    // minutes to this DateTime. The result is computed by rounding the
    // fractional number of minutes given by value to the nearest
    // millisecond, and adding that interval to this DateTime. The
    // value argument is permitted to be negative.
    //
    public AddMinutes(value: number): DateTime {
        return this.Add(value, MillisPerMinute);
    }

    // Returns the DateTime resulting from adding the given number of
    // months to this DateTime. The result is computed by incrementing
    // (or decrementing) the year and month parts of this DateTime by
    // months months, and, if required, adjusting the day part of the
    // resulting date downwards to the last day of the resulting month in the
    // resulting year. The time-of-day part of the result is the same as the
    // time-of-day part of this DateTime.
    //
    // In more precise terms, considering this DateTime to be of the
    // form y / m / d + t, where y is the
    // year, m is the month, d is the day, and t is the
    // time-of-day, the result is y1 / m1 / d1 + t,
    // where y1 and m1 are computed by adding months months
    // to y and m, and d1 is the largest value less than
    // or equal to d that denotes a valid day in month m1 of year
    // y1.
    //
    public AddMonths(months: number): DateTime {
        if (months < -120000 || months > 120000)
            throw new RangeError(LocalizationList.ArgumentOutOfRange_DateTimeBadMonths);
        let y, m, d: number;

        [y, m, d] = this.GetDatePart();

        let i: number = m - 1 + months;
        if (i >= 0) {
            m = i % 12 + 1;
            y = (y + i / 12) | 0; // coerce into valid integer
        } else {
            m = 12 + (i + 1) % 12;
            y = (y + (i - 11) / 12) | 0; // coerce into valid integer
        }
        if (y < 1 || y > 9999)
            throw new RangeError(LocalizationList.ArgumentOutOfRange_DateArithmetic)
        let days: number = DateTime.DaysInMonth(y, m);
        if (d > days) d = days;
        return new DateTime((DateTime.DateToTicks(y, m, d) + this.InternalTicks % TicksPerDay) | this.InternalKind);
    }
    
    // Returns the DateTime resulting from adding a fractional number of
    // seconds to this DateTime. The result is computed by rounding the
    // fractional number of seconds given by value to the nearest
    // millisecond, and adding that interval to this DateTime. The
    // value argument is permitted to be negative.
    //
    public AddSeconds(value: number): DateTime {
        return this.Add(value, MillisPerSecond);
    }

    // Returns the DateTime resulting from adding the given number of
    // 100-nanosecond ticks to this DateTime. The value argument
    // is permitted to be negative.
    //
    public AddTicks(value: bigint): DateTime {
        let ticks: bigint = this.InternalTicks;
        if (value > MaxTicks - ticks || value < MinTicks - ticks)
            throw new RangeError(LocalizationList.ArgumentOutOfRange_DateArithmetic);
        return new DateTime((ticks + value) | this.InternalKind);
    }

    // Returns the DateTime resulting from adding the given number of
    // years to this DateTime. The result is computed by incrementing
    // (or decrementing) the year part of this DateTime by value
    // years. If the month and day of this DateTime is 2/29, and if the
    // resulting year is not a leap year, the month and day of the resulting
    // DateTime becomes 2/28. Otherwise, the month, day, and time-of-day
    // parts of the result are the same as those of this DateTime.
    //
    public AddYears(value: number): DateTime {
        if (value < -10000 || value > 10000)
            throw new RangeError(LocalizationList.ArgumentOutOfRange_DateTimeBadYears);
        return this.AddMonths(value * 12);
    }

    // Returns the tick count corresponding to the given year, month, and day.
    // Will check the if the parameters are valid.
    private static DateToTicks(year: number, month: number, day: number): bigint {
        if (year >= 1 && year <= 9999 && month >= 1 && month <= 12) {
            const days: number[] = DateTime.IsLeapYear(year)? DaysToMonth366: DaysToMonth365;
            if (day >= 1 && day <= days[month] - days[month - 1]) {
                let y: number = year - 1;
                let n: number = y * 365 + ((y / 4) | 0) - ((y / 100) | 0) + ((y / 400) | 0) + days[month - 1] + day - 1;
                return BigInt(n) * TicksPerDay;
            }
        }
        throw new RangeError(LocalizationList.ArgumentOutOfRange_BadYearMonthDay);
    }

    // Return the tick count corresponding to the given hour, minute, second.
    // Will check the if the parameters are valid.
    private static TimeToTicks(hour: number, minute: number, second: number): bigint {
        //TimeSpan.TimeToTicks is a family access function which does no error checking, so
        //we need to put some error checking out here.
        if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60 && second >=0 && second < 60) {
            return 0n;//(TimeSpan.TimeToTicks(hour, minute, second));
        }
        throw new RangeError(LocalizationList.ArgumentOutOfRange_BadHourMinuteSecond);
    }

    // Returns the number of days in the month given by the year and
    // month arguments.
    //
    public static DaysInMonth(year: number, month: number): number {
        if (month < 1 || month > 12)
            throw new RangeError(LocalizationList.ArgumentOutOfRange_Month);
        // IsLeapYear checks the year argument
        const days: number[] = DateTime.IsLeapYear(year)? DaysToMonth366: DaysToMonth365;
        return days[month] - days[month - 1];
    }

    // Converts an OLE Date to a tick count.
    // This function is duplicated in COMDateTime.cpp
    private static DoubleDateToTicks(value: number): bigint {
        // The check done this way will take care of NaN
        if (!(value < OADateMaxAsDouble) || !(value > OADateMinAsDouble))
            throw new Error(LocalizationList.Arg_OleAutDateInvalid)

        // Conversion to long will not cause an overflow here, as at this point the "value" is in between OADateMinAsDouble and OADateMaxAsDouble
        let millis: bigint = BigInt(value * MillisPerDay + (value >= 0? 0.5: -0.5));
        // The interesting thing here is when you have a value like 12.5 it all positive 12 days and 12 hours from 01/01/1899
        // However if you a value of -12.25 it is minus 12 days but still positive 6 hours, almost as though you meant -11.75 all negative
        // This line below fixes up the millis in the negative case
        if (millis < 0)
            millis -= (millis % BigInt(MillisPerDay)) * 2n;

        millis += DoubleDateOffset / TicksPerMillisecond;
        if (millis < 0 || millis >= MaxMillis)
            throw new Error(LocalizationList.Arg_OleAutDateScale);
        return millis * TicksPerMillisecond;
    }

    public static FromBinary(dateData: bigint): DateTime {
        if ((dateData & LocalMask) != 0n) {
            // Local times need to be adjusted as you move from one time zone to another,
            // just as they are when serializing in text. As such the format for local times
            // changes to store the ticks of the UTC time, but with flags that look like a
            // local date.
            let ticks: bigint = dateData & TicksMask;
            // Negative ticks are stored in the top part of the range and should be converted back into a negative number
            if (ticks > TicksCeiling - TicksPerDay)
                ticks = ticks - TicksCeiling;
            // Convert the ticks back to local. If the UTC ticks are out of range, we need to default to
            // the UTC offset from MinValue and MaxValue to be consistent with Parse.
            let isAmbiguousLocalDst: boolean = false;
            let offsetTicks: bigint;
            if (ticks < MinTicks) {
                //offsetTicks = TimeZoneInfo.GetLocalUtcOffset(DateTime.MinValue, TimeZoneInfoOptions.NoThrowOnInvalidTime).Ticks;
            } else if (ticks > MaxTicks) {
                //offsetTicks = TimeZoneInfo.GetLocalUtcOffset(DateTime.MaxValue, TimeZoneInfoOptions.NoThrowOnInvalidTime).Ticks;
            } else {
                // Because the ticks conversion between UTC and local is lossy, we need to capture whether the
                // time is in a repeated hour so that it can be passed to the DateTime constructor.
                let utcDt: DateTime = new DateTime(ticks, DateTimeKind.Utc);
                let isDaylightSavings: boolean = false;
                //offsetTicks = TimeZoneInfo.GetUtcOffsetFromUtc(utcDt, TimeZoneInfo.Local, out isDaylightSavings, out isAmbiguousLocalDst).Ticks;
            }
            ticks += offsetTicks;
            // Another behavior of parsing is to cause small times to wrap around, so that they can be used
            // to compare times of day
            if (ticks < 0)
                ticks += TicksPerDay;
            if (ticks < MinTicks || ticks > MaxTicks)
                throw new Error(LocalizationList.Argument_DateTimeBadBinaryData);
            return new DateTime(ticks, DateTimeKind.Local, isAmbiguousLocalDst);
        } else {
            return DateTime.FromBinaryRaw(dateData);
        }
    }

    // A version of ToBinary that uses the real representation and does not adjust local times. This is needed for
    // scenarios where the serialized data must maintain compatability
    private static FromBinaryRaw(dateData: bigint): DateTime {
        let ticks: bigint = dateData & TicksMask
        if (ticks < MinTicks || ticks > MaxTicks)
            throw new Error(LocalizationList.Argument_DateTimeBadBinaryData);
        return new DateTime(dateData);
    }

    private GetDatePart(): [number, number, number] {
        let ticks: bigint = this.InternalTicks;
        // n = number of days since 1/1/0001
        let n: number = Number((ticks / TicksPerDay)) | 0;
        // y400 = number of whole 400-year periods since 1/1/0001
        let y400: number = (n / DaysPer400Years) | 0;
        // n = day number within 400-year period
        n -= y400 * DaysPer400Years;
        // y100 = number of whole 100-year periods within 400-year period
        let y100: number = (n / DaysPer100Years) | 0;
        // Last 100-year period has an extra day, so decrement result if 4
        if (y100 == 4) y100 = 3;
        // n = day number within 100-year period
        n -= y100 * DaysPer100Years;
        // y4 = number of whole 4-year periods within 100-year period
        let y4: number = (n / DaysPer4Years) | 0;
        // n = day number within 4-year period
        n -= y4 * DaysPer4Years;
        // y1 = number of whole years within 4-year period
        let y1 = (n / DaysPerYear) | 0;
        // Last year has an extra day, so decrement result if 4
        if (y1 == 4) y1 = 3;
        // compute year
        let year: number = y400 * 400 + y100 * 100 + y4 * 4 + y1 + 1;
        // n = day number within year
        n -= y1 * DaysPerYear;
        // dayOfYear = n + 1;
        // Leap year calculation looks different from IsLeapYear since y1, y4,
        // and y100 are relative to year 1, not year 0
        let leapYear: boolean = y1 == 3 && (y4 != 24 || y100 == 3);
        const days: number[] = leapYear ? DaysToMonth366 : DaysToMonth365;
        // All months have less than 32 days, so n >> 5 is a good conservative
        // estimate for the month
        let m: number = (n >> 5) + 1;
        // m = 1-based month number
        while (n >= days[m]) m++;
        // compute month and day
        let month: number = m;
        let day: number = n - days[m - 1] + 1;
        return [year, month, day];
    }

    private static IsValidTimeWithLeapSeconds(year: number, month: number, day: number, hour: number, minute: number, second: number, kind: DateTimeKind) {
        //TODO: implement
        return false;
    }

    // Returns the second part of this DateTime. The returned value is
    // an integer between 0 and 59.
    //
    public get Second(): number {
        return Number((this.InternalTicks / TicksPerSecond) % 60n);
    }

    // Returns the tick count for this DateTime. The returned value is
    // the number of 100-nanosecond intervals that have elapsed since 1/1/0001
    // 12:00am.
    //
    public get Ticks(): bigint {
        return this.InternalTicks;
    }

    //TimeOfDay

    //Today

    //Year

    // Checks whether a given year is a leap year. This method returns true if
    // year is a leap year, or false if not.
    //
    public static IsLeapYear(year: number): boolean {
        if (year < 1 || year > 9999)
            throw new RangeError(LocalizationList.ArgumentOutOfRange_Year);
        return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    }





}

export {DateTime}