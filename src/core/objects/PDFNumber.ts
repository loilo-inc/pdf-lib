import { copyStringIntoBuffer, numberToString } from "../../utils/index";

import PDFObject from "./PDFObject";

class PDFNumber extends PDFObject {
  static of = (value: number) => new PDFNumber(value);

  private readonly numberValue: number;
  private readonly stringValue: string;

  private constructor(value: number) {
    super();
    this.numberValue = value;
    this.stringValue = numberToString(value);
  }

  asNumber(): number {
    return this.numberValue;
  }

  /** @deprecated in favor of [[PDFNumber.asNumber]] */
  value(): number {
    return this.numberValue;
  }

  clone(): PDFNumber {
    return PDFNumber.of(this.numberValue);
  }

  async toString(): Promise<string> {
    return this.stringValue;
  }

  async sizeInBytes(): Promise<number> {
    return this.stringValue.length;
  }

  async copyBytesInto(buffer: Uint8Array, offset: number): Promise<number> {
    offset += copyStringIntoBuffer(this.stringValue, buffer, offset);
    return this.stringValue.length;
  }
}

export default PDFNumber;
