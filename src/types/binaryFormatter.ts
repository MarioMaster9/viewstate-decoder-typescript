import { HTMLWriter } from "./htmlWriter";
import { BytesHandle } from "./bytesReader";

class SerializationHeaderRecord {
    rootId: number;
    headerId: number;
    majorVersion: number;
    minorVersion: number;
    constructor(reader: BytesHandle) {
        this.rootId = reader.ReadInt32();
        this.headerId = reader.ReadInt32();
        this.majorVersion = reader.ReadInt32();
        this.minorVersion = reader.ReadInt32();
        HTMLWriter.writeListItem(`<b>RootId: </b>${this.rootId}`);
        HTMLWriter.writeListItem(`<b>HeaderId: </b>${this.headerId}`);
        HTMLWriter.writeListItem(`<b>Major Version: </b>${this.majorVersion}`);
        HTMLWriter.writeListItem(`<b>Minor Version: </b>${this.minorVersion}`);
    }
}

class BinaryLibrary {
    libraryId: number;
    libraryName: string;
    constructor(reader: BytesHandle) {
        this.libraryId = reader.ReadInt32();
        this.libraryName = reader.ReadNormalString();
        HTMLWriter.writeListItem(`<b>LibraryId: </b>${this.libraryId}`);
        HTMLWriter.writeListItem(`<b>LibraryName: </b>"${this.libraryName}"`);
    }
}

class ClassInfo {
    objectId: number;
    name: string;
    memberCount: number;
    memberNames: string[];
    constructor(reader: BytesHandle) {
        this.objectId = reader.ReadInt32();
        this.name = reader.ReadNormalString();
        this.memberCount = reader.ReadInt32();

        HTMLWriter.writeListItem(`<b>ObjectId: </b>${this.objectId}`);
        HTMLWriter.writeListItem(`<b>Name: </b>"${this.name}"`);
        HTMLWriter.writeListItem(`<b>MemberCount: </b>${this.memberCount}`);
        HTMLWriter.writeListItem(`<b>MemberNames:</b>`);

        this.memberNames = [];
        HTMLWriter.writeBeginTag("ul");
        for (let i = 0; i < this.memberCount; i++) {
            let item = reader.ReadNormalString();
            this.memberNames.push(item);
            HTMLWriter.writeListItem(`"${item}"`);
        }
        HTMLWriter.writeEndTag("ul");
    }
}

const TYPES = [
    "Primitive",
    "String",
    "Object",
    "SystemClass",
    "Class",
    "ObjectArray",
    "StringArray",
    "PrimitiveArray",
    "Boolean",
    "Byte",
    "Char",
    "INVALID",
    "Decimal",
    "Double",
    "Int16",
    "Int32",
    "Int64",
    "SByte",
    "Single",
    "TimeSpan",
    "DateTime",
    "UInt16",
    "UInt32",
    "UInt64",
    "Null",
    "String2"
]

class MemberTypeInfo {
    types: number[];
    constructor(reader: BytesHandle, memberCount: number) {
        this.types = new Array(memberCount);
        let additionalInfos = [];
        for (let i = 0; i < memberCount; i++) {
            let enumToken = reader.ReadByte();
            switch (enumToken) {
                case 0:
                    // Primitive
                    additionalInfos.push(i);
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    this.types[i] = enumToken;
                    break;
            }
        }

        for (let i = 0; i < additionalInfos.length; i++) {
            let enumToken = reader.ReadByte();
            this.types[additionalInfos[i]] = enumToken + 7
        }

        HTMLWriter.writeListItem(`<b>Types:</b>`);
        HTMLWriter.writeBeginTag("ul");
        for (let i = 0; i < this.types.length; i++) {
            HTMLWriter.writeListItem(TYPES[this.types[i]]);
        }
        HTMLWriter.writeEndTag("ul");
    }
}

class ClassWithMembersAndTypes {
    classInfo: ClassInfo;
    memberTypeInfo: MemberTypeInfo;
    name: string;
    memberCount: number;
    constructor(reader: BytesHandle) {
        HTMLWriter.writeListItem(`<b>ClassInfo</b>`);
        HTMLWriter.writeBeginTag("ul");
            this.classInfo = new ClassInfo(reader);
        HTMLWriter.writeEndTag("ul");

        HTMLWriter.writeListItem(`<b>MemberTypeInfo</b>`);
        HTMLWriter.writeBeginTag("ul");
            this.memberTypeInfo = new MemberTypeInfo(reader, this.classInfo.memberCount);
        HTMLWriter.writeEndTag("ul");

        this.name = reader.ReadNormalString();
        this.memberCount = reader.ReadInt32();
        HTMLWriter.writeListItem(`<b>Name: </b>${this.name}`);
        HTMLWriter.writeListItem(`<b>MemberCount: </b>${this.memberCount}`);
    }
}

class BinaryFormatter {
    static Deserialize(reader: BytesHandle) {
        while (!reader.AtEnd()) {
            let recordType = reader.ReadByte();
            switch (recordType) {
                case 0:
                    {
                        // SerializationHeaderRecord
                        HTMLWriter.writeListItem(`SerializationHeaderRecord`);
                        HTMLWriter.writeBeginTag("ul");
                            let value = new SerializationHeaderRecord(reader);
                        HTMLWriter.writeEndTag("ul");
                        return value;
                    }
                case 5:
                    {
                        // ClassWithMembersAndTypes
                        HTMLWriter.writeListItem(`ClassWithMembersAndTypes`);
                        HTMLWriter.writeBeginTag("ul");
                            let value = new ClassWithMembersAndTypes(reader);
                        HTMLWriter.writeEndTag("ul");
                        return value;
                    }
                case 12:
                    {
                        // BinaryLibrary
                        HTMLWriter.writeListItem(`BinaryLibrary`);
                        HTMLWriter.writeBeginTag("ul");
                            let value = new BinaryLibrary(reader);
                        HTMLWriter.writeEndTag("ul");
                        return value;
                    }
                default:
                    throw new Error(`Unknown record type: ${recordType}`);
            }
        }
    }
}

export {BinaryFormatter}