class BytesHandle {
  pos: number;
  data: ArrayBuffer | Array<number>;
  constructor(data: ArrayBuffer | Array<number>) {
    this.pos = 0;
    this.data = data;
  }
  
  ReadByte(): number {
    if (this.data instanceof Array) {
      return this.data[this.pos++];
    }
    let uint8Representation = new Uint8Array(this.data);
    return uint8Representation[this.pos++];
  }

  ReadChar() {
    let value = this.ReadByte();
    if (value > 0x7F) {
      return '\uFFFD';
    } else {
      return String.fromCharCode(value);
    }
  }

  Read7BitEncodedInt() {
    let count = 0;
    let shift = 0;
    let b = 0;
    do {
      if (shift == 5 * 7)
        throw new Error("Format_Bad7BitInt32");
      b = this.ReadByte();
      count |= (b & 0x7F) << shift;
      shift += 7;
    } while ((b & 0x80) != 0);
    return count;
  }

  ReadEncodedInt32() {
    return this.Read7BitEncodedInt();
  }

  ReadInt64() {
    let value = 0;
    for (let i = 0; i < 8; i++) {
      value |= this.ReadByte() << (i * 8);
    }
    return value;
  }
  
  ReadInt32() {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      value |= this.ReadByte() << (i * 8);
    }
    return value;
  }
  
  ReadInt16() {
    let value = 0;
    for (let i = 0; i < 2; i++) {
      value |= this.ReadByte() << (i * 8);
    }
    return value;
  }
  
  ReadString() {
    let len = this.Read7BitEncodedInt();
    let asciiArray = new Array(len);
    for (let i = 0; i < len; i++) {
      asciiArray[i] = this.ReadByte();
    }
    return String.fromCharCode(...asciiArray);
  }

  ReadNormalString() {
    let len = this.ReadByte();
    let asciiArray = new Array(len);
    for (let i = 0; i < len; i++) {
      asciiArray[i] = this.ReadByte();
    }
    return String.fromCharCode(...asciiArray);
  }

  AtEnd() {
    if (this.data instanceof ArrayBuffer) {
      return this.pos >= this.data.byteLength;
    } else {
      return this.pos >= this.data.length;
    }
  }

  ReadFloat() {
    // Create a buffer
    let buf = new ArrayBuffer(4);
    // Create a data view of it
    let view = new DataView(buf);

    // set bytes
    for (let i = 0; i < 4; i++) {
      // little endian (reverse order)
      let index = 4 - 1 - (i);
      view.setUint8(index, this.ReadByte());
    }

    // Read the bits as a float
    return view.getFloat32(0);
  }
  
  ReadDouble() {
    // Create a buffer
    let buf = new ArrayBuffer(8);
    // Create a data view of it
    let view = new DataView(buf);

    // set bytes
    for (let i = 0; i < 8; i++) {
      // little endian (reverse order)
      let index = 8 - 1 - (i);
      view.setUint8(index, this.ReadByte());
    }

    // Read the bits as a float/native 64-bit double
    return view.getFloat64(0);
  }
}
export {BytesHandle}