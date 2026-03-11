import { MethodNotImplementedError } from "../errors";
import PDFContext from "../PDFContext";

abstract class PDFObject {
  clone(_context?: PDFContext): PDFObject {
    throw new MethodNotImplementedError(this.constructor.name, "clone");
  }

  abstract toString(): Promise<string>;

  abstract sizeInBytes(): Promise<number>;

  abstract copyBytesInto(_buffer: Uint8Array, _offset: number): Promise<number>;
}

export default PDFObject;
