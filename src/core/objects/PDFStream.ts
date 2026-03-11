import { MethodNotImplementedError } from "../errors";
import PDFContext from "../PDFContext";
import CharCodes from "../syntax/CharCodes";
import PDFDict from "./PDFDict";
import PDFName from "./PDFName";
import PDFNumber from "./PDFNumber";
import PDFObject from "./PDFObject";

abstract class PDFStream extends PDFObject {
  readonly dict: PDFDict;

  constructor(dict: PDFDict) {
    super();
    this.dict = dict;
  }

  clone(_context?: PDFContext): PDFStream {
    throw new MethodNotImplementedError(this.constructor.name, "clone");
  }

  abstract getContentsString(): Promise<string>;

  abstract getContents(): Promise<Uint8Array>;

  abstract getContentsSize(): Promise<number>;

  async updateDict(): Promise<void> {
    const contentsSize = await this.getContentsSize();
    this.dict.set(PDFName.Length, PDFNumber.of(contentsSize));
  }

  async sizeInBytes(): Promise<number> {
    await this.updateDict();
    const size = await this.dict.sizeInBytes();
    const contentsSize = await this.getContentsSize();
    return size + contentsSize + 18;
  }

  async toString(): Promise<string> {
    await this.updateDict();
    let streamString = await this.dict.toString();
    streamString += "\nstream\n";
    streamString += await this.getContentsString();
    streamString += "\nendstream";
    return streamString;
  }

  async copyBytesInto(buffer: Uint8Array, offset: number): Promise<number> {
    await this.updateDict();
    const initialOffset = offset;

    offset += await this.dict.copyBytesInto(buffer, offset);
    buffer[offset++] = CharCodes.Newline;

    buffer[offset++] = CharCodes.s;
    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.a;
    buffer[offset++] = CharCodes.m;
    buffer[offset++] = CharCodes.Newline;

    const contents = await this.getContents();
    for (let idx = 0, len = contents.length; idx < len; idx++) {
      buffer[offset++] = contents[idx];
    }

    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.n;
    buffer[offset++] = CharCodes.d;
    buffer[offset++] = CharCodes.s;
    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.a;
    buffer[offset++] = CharCodes.m;

    return offset - initialOffset;
  }
}

export default PDFStream;
