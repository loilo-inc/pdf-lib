import PDFDict from "../objects/PDFDict";
import CharCodes from "../syntax/CharCodes";

class PDFTrailerDict {
  static of = (dict: PDFDict) => new PDFTrailerDict(dict);

  readonly dict: PDFDict;

  private constructor(dict: PDFDict) {
    this.dict = dict;
  }

  async toString(): Promise<string> {
    return `trailer\n${await this.dict.toString()}`;
  }

  async sizeInBytes(): Promise<number> {
    return 8 + (await this.dict.sizeInBytes());
  }

  async copyBytesInto(buffer: Uint8Array, offset: number): Promise<number> {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.a;
    buffer[offset++] = CharCodes.i;
    buffer[offset++] = CharCodes.l;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.Newline;

    offset += await this.dict.copyBytesInto(buffer, offset);

    return offset - initialOffset;
  }
}

export default PDFTrailerDict;
