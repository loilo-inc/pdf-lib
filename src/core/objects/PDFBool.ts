import { PrivateConstructorError } from "../errors";
import CharCodes from "../syntax/CharCodes";
import PDFObject from "./PDFObject";

const ENFORCER = {};

class PDFBool extends PDFObject {
  static readonly True = new PDFBool(ENFORCER, true);
  static readonly False = new PDFBool(ENFORCER, false);

  private readonly value: boolean;

  private constructor(enforcer: any, value: boolean) {
    if (enforcer !== ENFORCER) throw new PrivateConstructorError("PDFBool");
    super();
    this.value = value;
  }

  asBoolean(): boolean {
    return this.value;
  }

  clone(): PDFBool {
    return this;
  }

  async toString(): Promise<string> {
    return String(this.value);
  }

  async sizeInBytes(): Promise<number> {
    return this.value ? 4 : 5;
  }

  async copyBytesInto(buffer: Uint8Array, offset: number): Promise<number> {
    if (this.value) {
      buffer[offset++] = CharCodes.t;
      buffer[offset++] = CharCodes.r;
      buffer[offset++] = CharCodes.u;
      buffer[offset++] = CharCodes.e;
      return 4;
    } else {
      buffer[offset++] = CharCodes.f;
      buffer[offset++] = CharCodes.a;
      buffer[offset++] = CharCodes.l;
      buffer[offset++] = CharCodes.s;
      buffer[offset++] = CharCodes.e;
      return 5;
    }
  }
}

export default PDFBool;
