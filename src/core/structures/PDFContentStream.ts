import PDFDict from "../objects/PDFDict";
import PDFOperator from "../operators/PDFOperator";
import PDFContext from "../PDFContext";
import CharCodes from "../syntax/CharCodes";
import PDFFlateStream from "./PDFFlateStream";

class PDFContentStream extends PDFFlateStream {
  static of = (dict: PDFDict, operators: PDFOperator[], encode = true) =>
    new PDFContentStream(dict, operators, encode);

  private readonly operators: PDFOperator[];

  private constructor(dict: PDFDict, operators: PDFOperator[], encode = true) {
    super(dict, encode);
    this.operators = operators;
  }

  push(...operators: PDFOperator[]): void {
    this.operators.push(...operators);
  }

  clone(context?: PDFContext): PDFContentStream {
    const operators = new Array(this.operators.length);
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      operators[idx] = this.operators[idx].clone(context);
    }
    const { dict, encode } = this;
    return PDFContentStream.of(dict.clone(context), operators, encode);
  }

  async getContentsString(): Promise<string> {
    let value = "";
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      value += `${this.operators[idx]}\n`;
    }
    return value;
  }

  async getUnencodedContents(): Promise<Uint8Array> {
    const contentsSize = this.getUnencodedContentsSize();
    const buffer = new Uint8Array(contentsSize);
    let offset = 0;
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      offset += this.operators[idx].copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }
    return buffer;
  }

  private getUnencodedContentsSize(): number {
    let size = 0;
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      size += this.operators[idx].sizeInBytes() + 1;
    }
    return size;
  }
}

export default PDFContentStream;
