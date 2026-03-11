import CharCodes from "../syntax/CharCodes";
import PDFObject from "./PDFObject";

class PDFNull extends PDFObject {
  asNull(): null {
    return null;
  }

  clone(): PDFNull {
    return this;
  }

  async toString(): Promise<string> {
    return "null";
  }

  async sizeInBytes(): Promise<number> {
    return 4;
  }

  async copyBytesInto(buffer: Uint8Array, offset: number): Promise<number> {
    buffer[offset++] = CharCodes.n;
    buffer[offset++] = CharCodes.u;
    buffer[offset++] = CharCodes.l;
    buffer[offset++] = CharCodes.l;
    return 4;
  }
}

export default new PDFNull();
