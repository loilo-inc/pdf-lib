import { arrayAsString } from "../../utils";
import PDFContext from "../PDFContext";
import PDFDict from "./PDFDict";
import PDFStream from "./PDFStream";

class PDFRawStream extends PDFStream {
  static of = (dict: PDFDict, contents: Uint8Array) =>
    new PDFRawStream(dict, contents);

  readonly contents: Uint8Array;

  private constructor(dict: PDFDict, contents: Uint8Array) {
    super(dict);
    this.contents = contents;
  }

  asUint8Array(): Uint8Array {
    return this.contents.slice();
  }

  clone(context?: PDFContext): PDFRawStream {
    return PDFRawStream.of(this.dict.clone(context), this.contents.slice());
  }

  async getContentsString(): Promise<string> {
    return arrayAsString(this.contents);
  }

  async getContents(): Promise<Uint8Array> {
    return this.contents;
  }

  async getContentsSize(): Promise<number> {
    return this.contents.length;
  }
}

export default PDFRawStream;
