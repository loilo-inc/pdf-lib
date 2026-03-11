import PDFContext from "../PDFContext";

abstract class PDFObject {
  abstract clone(_context?: PDFContext): PDFObject;

  abstract toString(): string;

  abstract sizeInBytes(): number;

  abstract copyBytesInto(_buffer: Uint8Array, _offset: number): number;
}

export abstract class PDFAsyncObject {
  abstract clone(_context?: PDFContext): PDFAsyncObject;

  abstract toString(): Promise<string>;

  abstract sizeInBytes(): Promise<number>;

  abstract copyBytesInto(_buffer: Uint8Array, _offset: number): Promise<number>;
}

export default PDFObject;
