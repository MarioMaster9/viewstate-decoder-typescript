import { HTMLWriter } from "./htmlWriter"
import { BytesHandle } from "./bytesReader";
import { BinaryFormatter } from "./binaryFormatter";
import { Unit } from "./unit";
import { Pair } from "./pair";
import { Triplet } from "./triplet";

enum Token {
    Int16 = 1,
    Int32,
    Byte,
    Char,
    String,
    DateTime,
    Double,
    Single,
    Color,
    KnownColor,
    IntEnum,
    EmptyColor,
    Pair = 15,
    Triplet,
    Array = 20,
    StringArray,
    ArrayList,
    Hashtable,
    HybridDictionary,
    Type,
    Nullable, //DEPRECATED
    Unit,
    EmptyUnit,
    EventValidationStore,
// String-table optimized strings
    IndexedStringAdd,
    IndexedString,
// Semi-optimized (TypeConverter-based)
    StringFormatted = 40,
// Semi-optimized (Types)
    TypeRefAdd,
    TypeRefAddLocal,
    TypeRef,
// Un-optimized (Binary serialized) types
    BinarySerialized = 50,
// Optimized for sparse arrays
    SparseArray = 60,
// Constant values
    Null = 100,
    EmptyString,
    ZeroInt32,
    True,
    False
}

const typeMapping = [
    "0",
    "Pixel",
    "Point",
    "Pica",
    "Inch",
    "Mm",
    "Cm",
    "Percentage",
    "Em",
    "Ex"
]

const knownColors = [
    "0",
    "ActiveBorder",
    "ActiveCaption",
    "ActiveCaptionText",
    "AppWorkspace",
    "Control",
    "ControlDark",
    "ControlDarkDark",
    "ControlLight",
    "ControlLightLight",
    "ControlText",
    "Desktop",
    "GrayText",
    "Highlight",
    "HighlightText",
    "HotTrack",
    "InactiveBorder",
    "InactiveCaption",
    "InactiveCaptionText",
    "Info",
    "InfoText",
    "Menu",
    "MenuText",
    "ScrollBar",
    "Window",
    "WindowFrame",
    "WindowText",
    "Transparent",
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenrod",
    "DarkGray",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DodgerBlue",
    "Firebrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "Goldenrod",
    "Gray",
    "Green",
    "GreenYellow",
    "Honeydew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenrodYellow",
    "LightGray",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquamarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenrod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
    "ButtonFace",
    "ButtonHighlight",
    "ButtonShadow",
    "GradientActiveCaption",
    "GradientInactiveCaption",
    "MenuBar",
    "MenuHighlight"
]

function byteToHex(value: number) {
    return value.toString(16).padStart(2, '0').toUpperCase();
}
function shortToHex(value: number) {
    return value.toString(16).padStart(4, '0').toUpperCase();
}

class ObjectStateFormatter {
    stringTable: string[];
    formatMarker: number;
    versionMarker: number;
    constructor(){
    }

    Deserialize(data: ArrayBuffer) {
        document.getElementById("result").innerHTML = "";
        let reader = new BytesHandle(data);
        this.stringTable = [];
        this.formatMarker = reader.ReadByte();
        this.versionMarker = reader.ReadByte();
        HTMLWriter.writeContent(`Format marker: ${byteToHex(this.formatMarker)}<br />\r\n`);
        if (this.formatMarker != 0xFF) {
            HTMLWriter.writeContent("Unknown format marker, exiting!<br />");
            HTMLWriter.pop();
            return;
        }
        HTMLWriter.writeContent(`Version marker: ${byteToHex(this.versionMarker)}<br />\r\n`);
        if (this.versionMarker != 0x01) {
            HTMLWriter.writeContent("Unknown version marker, exiting!<br />");
            HTMLWriter.pop();
            return;
        }
        this.DeserializeValue(reader);
        HTMLWriter.pop();
    }

    DeserializeIndexedString(reader: BytesHandle, token: number) {
        if (token == Token.IndexedString) {
            // reference to string in the current string table
            let tableIndex = reader.ReadByte();

            return this.stringTable[tableIndex];
        } else {
            // first occurrence of this indexed string. Read in the string, and add
            // a reference to it, so future references can be resolved.
            let s = reader.ReadString();

            this.stringTable.push(s);
            return s;
        }
    }

    DeserializeType(reader: BytesHandle) {
        let token = reader.ReadByte();
        console.assert((token == Token.TypeRef) || (token == Token.TypeRefAdd) || (token == Token.TypeRefAddLocal));

        if (token == Token.TypeRef) {
            // reference by index into type table
            let typeID = reader.ReadEncodedInt32();
            return `type-ref(${typeID})`;//null;//return (Type)_typeList[typeID];
        } else {
            // first occurrence of this type. Read in the type, resolve it, and
            // add it to the type table
            let typeName = reader.ReadString();

            let resolvedType = typeName;

            //TODO: add all the type code

            //AddDeserializationTypeReference(resolvedType);
            return resolvedType;
        }
    }

    DeserializeValue(reader: BytesHandle): any {
        let token = reader.ReadByte();


        switch(token) {
            case Token.Null:
                HTMLWriter.writeListItem("<i>null</i>");
                return null;
            case Token.EmptyString:
                HTMLWriter.writeListItem("<i>String.Empty</i>");
                return "";
            case Token.String:
                {
                    let value = reader.ReadString();
                    HTMLWriter.writeStringListItem(`"${value}"`);
                    return value;
                }
            case Token.ZeroInt32:
                HTMLWriter.writeListItem("0");
                return 0;
            case Token.Int32:
                {
                    let value = reader.ReadEncodedInt32();
                    HTMLWriter.writeListItem(value.toString());
                    return value;
                }
            case Token.Pair:
                {
                    HTMLWriter.writeListItem("<b>Pair</b>");
                    HTMLWriter.writeBeginTag("ul");
                        let first = this.DeserializeValue(reader);
                        let second = this.DeserializeValue(reader);
                    HTMLWriter.writeEndTag("ul");
                    return new Pair(first, second);
                }
            case Token.Triplet:
                {
                    HTMLWriter.writeListItem("<b>Triplet</b>");
                    HTMLWriter.writeBeginTag("ul");
                        let first = this.DeserializeValue(reader);
                        let second = this.DeserializeValue(reader);
                        let third = this.DeserializeValue(reader);
                    HTMLWriter.writeEndTag("ul");
                    return new Triplet(first, second, third);
                }
            case Token.IndexedString:
            case Token.IndexedStringAdd:
                {
                    let value = this.DeserializeIndexedString(reader, token);
                    HTMLWriter.writeListItem(`"${value}"`);
                    return value;
                }
            case Token.ArrayList:
                {
                    let count = reader.ReadEncodedInt32();
                    HTMLWriter.writeListItem(`<b>ArrayList</b> of ${count} element(s):`);
                    let list = [];
                    HTMLWriter.writeBeginTag("ul");
                    for (let i = 0; i < count; i++) {
                        list.push(this.DeserializeValue(reader));
                    }
                    HTMLWriter.writeEndTag("ul");
                    return list;
                }
            case Token.True:
                HTMLWriter.writeListItem("True");
                return true;
            case Token.False:
                HTMLWriter.writeListItem("False");
                return false;
            case Token.Byte:
                {
                    let value = reader.ReadByte();
                    HTMLWriter.writeListItem(`Byte: ${byteToHex(value)}`);
                    return value;
                }
            case Token.Char:
                {
                    let value = reader.ReadChar();
                    HTMLWriter.writeListItem(`Char: '${value}' (U+${shortToHex(value.charCodeAt(0))})`);
                    return value;
                }
            case Token.DateTime:
                {
                    let value = reader.ReadInt64();//DateTime.FromBinary(reader.ReadInt64());
                    //TODO: output datetime to the html
                    return value;
                }
            case Token.Double:
                {
                    let value = reader.ReadDouble();
                    HTMLWriter.writeListItem(`Double: ${value}`);
                    return value;
                }
            case Token.Int16:
                {
                    let value = reader.ReadInt16();
                    HTMLWriter.writeListItem(`Int16: ${value}`);
                    return value;
                }
            case Token.Single:
                {
                    let value = reader.ReadFloat();
                    HTMLWriter.writeListItem(`Single: ${value}`);
                    return value;
                }
            case Token.Hashtable:
            case Token.HybridDictionary:
                {
                    let count = reader.ReadEncodedInt32();
                    let headerName = (token == Token.Hashtable) ? "Hashtable" : "HybridDictionary";
                    HTMLWriter.writeListItem(`<b>${headerName}</b> of ${count} element(s):`);

                    let table: Record<any, any> = {};
                    HTMLWriter.writeBeginTag("ul");
                    for (let i = 0; i < count; i++) {
                        HTMLWriter.writeListItem("<b>Key:</b>");
                        HTMLWriter.writeBeginTag("ul");
                            let key = this.DeserializeValue(reader);
                        HTMLWriter.writeEndTag("ul");

                        HTMLWriter.writeListItem("<b>Value:</b>");
                        HTMLWriter.writeBeginTag("ul");
                            let value = this.DeserializeValue(reader);
                        HTMLWriter.writeEndTag("ul");

                        table[key] = value;
                    }
                    HTMLWriter.writeEndTag("ul");

                    return table;
                }
            case Token.StringArray:
                {
                    let count = reader.ReadEncodedInt32();
                    HTMLWriter.writeListItem(`<b>String[]</b> of ${count} element(s):`);

                    let array = new Array(count);
                    HTMLWriter.writeBeginTag("ul");
                    for (let i = 0; i < count; i++) {
                        let value = reader.ReadString();
                        HTMLWriter.writeListItem(`"${value}"`);
                        array[i] = value;
                    }
                    HTMLWriter.writeEndTag("ul");

                    return array;
                }
            case Token.Array:
                {
                    let elementType = this.DeserializeType(reader);
                    let count = reader.ReadEncodedInt32();

                    HTMLWriter.writeListItem(`<b>Array of type <i>${elementType}</i></b> of ${count} element(s):`);

                    let array = new Array(count);
                    HTMLWriter.writeBeginTag("ul");
                    for (let i = 0; i < count; i++) {
                        array[i] = this.DeserializeValue(reader);
                    }
                    HTMLWriter.writeEndTag("ul");

                    return array;
                }
            case Token.Color:
                {
                    let value = reader.ReadInt32();
                    let a = (value&0xFF000000)>>>24;
                    let r = (value&0xFF0000)>>>16;
                    let g = (value&0xFF00)>>>8;
                    let b = (value&0xFF);
                    HTMLWriter.writeListItem(`Color: Color [A=${a}, R=${r}, G=${g}, B=${b}]`);
                    return;    //TODO: Color
                }
            case Token.EmptyColor:
                HTMLWriter.writeListItem(`Color.Empty`);
                return;    //TODO: Color
            case Token.KnownColor:
                {
                    let knownColor = reader.ReadEncodedInt32();

                    let colorName = knownColor.toString();
                    if (knownColor < knownColors.length && knownColor >= 0) {
                        colorName = knownColors[knownColor];
                    }

                    HTMLWriter.writeListItem(`Color: Color [${colorName}]`);
                    return; //TODO: Color
                }
            case Token.Unit:
                {
                    let unit = reader.ReadDouble();
                    let unitType = reader.ReadInt32();

                    let typeName = unitType.toString();
                    if (unitType < typeMapping.length && unitType >= 0) {
                        typeName = typeMapping[unitType];
                    }
                    HTMLWriter.writeListItem(`Unit: ${unit} ${typeName}`)

                    return new Unit(unit, unitType);
                }
            case Token.EmptyUnit:
                HTMLWriter.writeListItem(`Unit.Empty`);
                return new Unit(0.0, 1);
            case Token.StringFormatted:
                {
                    let result = null;

                    let valueType = this.DeserializeType(reader);
                    let formattedValue = reader.ReadString();

                    HTMLWriter.writeListItem(`Formatted string: '${formattedValue}' [${valueType}]`);
                    return formattedValue;
                }
            case Token.BinarySerialized:
                {
                    // CUSTOM (not part of azurewebsites deserializer this project is based on)
                    let length = reader.ReadEncodedInt32();

                    let buffer = new Array<number>(length);
                    for (let i = 0; i < length; i++) {
                        buffer[i] = reader.ReadByte();
                    }

                    let ms = new BytesHandle(buffer);
                    HTMLWriter.writeListItem("<b>BinaryFormatter</b>");
                    HTMLWriter.writeBeginTag("ul");
                        let data = BinaryFormatter.Deserialize(ms);
                    HTMLWriter.writeEndTag("ul");

                    return data;
                }
            case Token.SparseArray:
                {
                    let elementType = this.DeserializeType(reader);
                    let count = reader.ReadEncodedInt32();
                    let itemCount = reader.ReadEncodedInt32();
                    HTMLWriter.writeListItem(`<b>Sparse array:</b> ${elementType}[${count}] with ${itemCount} populated element(s)`);

                    // Guard against bad data
                    if (itemCount > count)
                        throw new Error("SR.InvalidSerializedData");

                    let array = new Array(count);
                    HTMLWriter.writeBeginTag("ul");
                    for (let i = 0; i < itemCount; ++i) {
                        // Data is encoded as <index, Item>
                        let nextPos = reader.ReadEncodedInt32();

                        // Guard against bad data (nextPos way too big, or nextPos not increasing)
                        if (nextPos >= count || nextPos < 0)
                            throw new Error("SR.InvalidSerializedData");
                        HTMLWriter.writeListItem(`<b>Index:</b> ${nextPos}`);
                        HTMLWriter.writeListItem("<b>Value:</b>");

                        HTMLWriter.writeBeginTag("ul");
                            array[nextPos] = this.DeserializeValue(reader);
                        HTMLWriter.writeEndTag("ul");
                    }
                    HTMLWriter.writeEndTag("ul");

                    return array;
                }
            default:
                throw new Error(`Unhandled Token: ${token}`);
        }
    }
}
