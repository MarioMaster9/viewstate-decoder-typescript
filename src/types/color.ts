import { KnownColor } from './knownColor';

function getKeyByValue(object: any, value: any) {
  return Object.keys(object).find(key => object[key] === value);
}

const StateKnownColorValid = 0x0001;
const StateARGBValueValid = 0x0002;
const StateValueMask = StateARGBValueValid;
const StateNameValid = 0x0008;
const NotDefinedValue = 0;

// Shift counts and bit masks for A, R, G, B components in ARGB mode

const ARGBAlphaShift: number = 24;
const ARGBRedShift = 16;
const ARGBGreenShift = 8;
const ARGBBlueShift = 0;
const ARGBAlphaMask = 0xFF << ARGBAlphaShift;
const ARGBRedMask = 0xFF << ARGBRedShift;
const ARGBGreenMask = 0xFF << ARGBGreenShift;
const ARGBBlueMask = 0xFF << ARGBBlueShift;
class Color {
    // User supplied name of color. Will not be filled in if
    // we map to a "knowncolor"
    readonly name: string;

    // Standard 32bit sRGB (ARGB)
    readonly value: number;

    // Ignored, unless "state" says it is valid
    readonly knownColor: number;

    // State flags.
    readonly state: number;

    public constructor(knownColor: number);
    public constructor(value: number, state: number, name: string, knownColor: number);
    

    constructor(knownColorOrValue: number, state?: number, name?: string, knownColor?: number) {
        if (state === null) {
            this.value = 0;
            this.state = StateKnownColorValid;
            this.name = null;
            this.knownColor = knownColorOrValue & 0xFFFF;
        } else {
            this.value = knownColorOrValue;
            this.state = state;
            this.name = name;
            this.knownColor = knownColor & 0xFFFF;
        }
    }

    get R() {
        return this.Value >>> ARGBRedShift;
    }

    get G() {
        return this.Value >>> ARGBGreenShift;
    }

    get B() {
        return this.Value >>> ARGBBlueShift;
    }

    get A() {
        return this.Value >>> ARGBAlphaShift;
    }

    get IsKnownColor(): boolean {
        return (this.state & StateKnownColorValid) != 0
    }

    get IsEmpty(): boolean {
        return this.state == 0;
    }

    get IsNamedColor(): boolean {
        return ((this.state & StateNameValid) != 0) || this.IsKnownColor
    }

    //get IsSystemColor(): boolean {
    //    return this.IsKnownColor && IsKnownColorSystem(this.knownColor);
    //}

    get Name(): string {
        if ((this.state & StateNameValid) != 0) {

            return this.name;
        }

        if (this.IsKnownColor) {
            let tablename = getKeyByValue(KnownColor, this.knownColor);
            if (tablename != null) {
                return tablename; 
            }
        }

        return this.value.toString();
    }

    get Value(): number {
        if ((this.state & StateValueMask) != 0) {
            return this.value;
        }

        // This is the only place we have system colors value exposed
        if (this.IsKnownColor) {
            return 0;
        }

        return NotDefinedValue;
    }

    static FromArgb(argb: number): Color {
        return new Color(argb, StateARGBValueValid, null, 0);
    }

    /*FromArgb(alpha: number, red: number, green: number, blue: number) {

    }*/

    static FromKnownColor(knownColor: number) {
        return new Color(knownColor);
    }

    toString() {
        if (this.IsNamedColor) {
            return `${"Color"} [${this.Name}]`;
        } else if ((this.state & StateValueMask) != 0) {
            return `${"Color"} [A=${this.A}, R=${this.R}, G=${this.G}, B=${this.B}]`;
        } else {
            return `${"Color"} [Empty]`;
        }
    }
}

export {Color}