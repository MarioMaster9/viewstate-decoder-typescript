import { LocalizationList } from "localization";

const Int64_MaxValue = 9223372036854775807n;
const Int64_MinValue = -9223372036854775808n;


const TicksPerMillisecond: bigint = 10000n;
const MillisecondsPerTick: number = 1.0 / Number(TicksPerMillisecond);

const TicksPerSecond: bigint = TicksPerMillisecond * 1000n;   // 10,000,000
const SecondsPerTick: number = 1.0 / Number(TicksPerSecond)   // 0.0001

const TicksPerMinute: bigint = TicksPerSecond * 60n;         // 600,000,000
const MinutesPerTick: number = 1.0 / Number(TicksPerMinute); // 1.6666666666667e-9

const TicksPerHour: bigint = TicksPerMinute * 60n;        // 36,000,000,000
const HoursPerTick: number = 1.0 / Number(TicksPerHour)   // 2.77777777777777778e-11

const TicksPerDay: bigint = TicksPerHour * 24n;          // 864,000,000,000
const DaysPerTick: number = 1.0 / Number(TicksPerDay);   // 1.1574074074074074074e-12

const MillisPerSecond: number = 1000;
const MillisPerMinute: number = MillisPerSecond * 60; //     60,000
const MillisPerHour: number = MillisPerMinute * 60;   //  3,600,000
const MillisPerDay: number = MillisPerHour * 24;      // 86,400,000

const MaxSeconds: bigint = Int64_MaxValue / TicksPerSecond;
const MinSeconds: bigint = Int64_MinValue / TicksPerSecond;

const MaxMilliSeconds: bigint = Int64_MaxValue / TicksPerMillisecond;
const MinMilliSeconds: bigint = Int64_MinValue / TicksPerMillisecond;

const TicksPerTenthSecond = TicksPerMillisecond * 100n;

class TimeSpan {
    public static get Zero(): TimeSpan {
        return new TimeSpan(0n);
    }

    public static get MaxValue(): TimeSpan {
        return new TimeSpan(Int64_MaxValue);
    }

    public static get MinValue(): TimeSpan {
        return new TimeSpan(Int64_MinValue);
    }

    // internal so that DateTime doesn't have to call an extra get
    // method for some arithmetic operations.
    private _ticks: bigint;

    constructor(ticks: bigint);
    constructor(hours: number, minutes: number, seconds: number);
    constructor(days: number, hours: number, minutes: number, seconds: number);
    constructor(days: number, hours: number, minutes: number, seconds: number, milliseconds: number);
    
    constructor(ticksOrHoursOrDays: bigint | number, minutesOrHours?: number, secondsOrMinutes?: number, seconds?: number, milliseconds?: number) {
        if (typeof(ticksOrHoursOrDays) == 'bigint') {
            this._ticks = ticksOrHoursOrDays;
        } else {
            if (milliseconds != null) {
                let days: number = ticksOrHoursOrDays;
                let hours: number = minutesOrHours;
                let minutes: number = secondsOrMinutes;
                let totalMilliSeconds: bigint = (BigInt(days) * 3600n * 24n + BigInt(hours) * 3600n + BigInt(minutes) * 60n + BigInt(seconds)) * 1000n + BigInt(milliseconds);
                if (totalMilliSeconds > MaxMilliSeconds || totalMilliSeconds < MinMilliSeconds)
                    throw new RangeError(LocalizationList.Overflow_TimeSpanTooLong);
                this._ticks = totalMilliSeconds * TicksPerMillisecond;
            } else if (seconds != null) {
                let days: number = ticksOrHoursOrDays;
                let hours: number = minutesOrHours;
                let minutes: number = secondsOrMinutes;
                let totalMilliSeconds: bigint = (BigInt(days) * 3600n * 24n + BigInt(hours) * 3600n + BigInt(minutes) * 60n + BigInt(seconds)) * 1000n;
                if (totalMilliSeconds > MaxMilliSeconds || totalMilliSeconds < MinMilliSeconds)
                    throw new RangeError(LocalizationList.Overflow_TimeSpanTooLong);
                this._ticks = totalMilliSeconds * TicksPerMillisecond;
            } else if (secondsOrMinutes != null) {
                let hours: number = ticksOrHoursOrDays;
                let minutes: number = minutesOrHours;
                let seconds: number = secondsOrMinutes;
                this._ticks = TimeSpan.TimeToTicks(hours, minutes, seconds);
            }
        }
    }

    public get Ticks(): bigint {
        return this._ticks;
    }

    public get Days(): number {
        return Number(this._ticks / TicksPerDay);
    }

    public get Hours(): number {
        return Number((this._ticks / TicksPerHour) % 24n);
    }

    public get Milliseconds(): number {
        return Number((this._ticks / TicksPerMillisecond) % 1000n);
    }

    public get Minutes(): number {
        return Number((this._ticks / TicksPerMinute) % 60n);
    }

    public get Seconds(): number {
        return Number((this._ticks / TicksPerSecond) % 60n);
    }

    public get TotalDays(): number {
        return Number(this._ticks) * DaysPerTick;
    }

    public get TotalHours(): number {
        return Number(this._ticks) * HoursPerTick;
    }

    public get TotalMilliseconds(): number {
        let temp: number = Number(this._ticks) * MillisecondsPerTick;
        if (temp > MaxMilliSeconds)
            return Number(MaxMilliSeconds);

        if (temp < MinMilliSeconds)
            return Number(MinMilliSeconds);

        return temp;
    }

    public get TotalMinutes(): number {
        return Number(this._ticks) * MinutesPerTick;
    }

    public get TotalSeconds(): number {
        return Number(this._ticks) * SecondsPerTick;
    }

    public Add(ts: TimeSpan) : TimeSpan {
        let result: bigint = this._ticks + ts._ticks;
        // Overflow if signs of operands was identical and result's
        // sign was opposite.
        // >> 63 gives the sign bit (either 64 1's or 64 0's).
        //if ((this._ticks >> 63n == ts._ticks >> 63n) && (this._ticks >> 63n != result >> 63n))
        //    throw new R

        return new TimeSpan(result);


    }

    // FromDays

    // Duration

    // Equals

    // FromHours

    // Interval

    // FromMilliseconds

    // FromMinutes

    // Negate

    // FromSeconds

    // Subtract

    // FromTicks

    private static TimeToTicks(hour: number, minute: number, second: number): bigint {
        // totalSeconds is bounded by 2^31 * 2^12 + 2^31 * 2^8 + 2^31,
        // which is less than 2^44, meaning we won't overflow totalSeconds.
        let totalSeconds: bigint = BigInt(hour) * 3600n + BigInt(minute) * 60n + BigInt(second);
        //
        //
        return totalSeconds * TicksPerSecond;
    }
}