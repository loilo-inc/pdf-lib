import { copyStringIntoBuffer } from "../../utils";
import PDFArray from "../objects/PDFArray";
import PDFHexString from "../objects/PDFHexString";
import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
import PDFObject from "../objects/PDFObject";
import PDFString from "../objects/PDFString";
import PDFContext from "../PDFContext";
import CharCodes from "../syntax/CharCodes";
import PDFOperatorNames from "./PDFOperatorNames";

export type PDFOperatorArg =
  | string
  | PDFName
  | PDFArray
  | PDFNumber
  | PDFString
  | PDFHexString;

class PDFOperator {
  static of = (name: PDFOperatorNames, args?: PDFOperatorArg[]) =>
    new PDFOperator(name, args);

  private readonly name: PDFOperatorNames;
  private readonly args: PDFOperatorArg[];

  private constructor(name: PDFOperatorNames, args?: PDFOperatorArg[]) {
    this.name = name;
    this.args = args || [];
  }

  clone(context?: PDFContext): PDFOperator {
    const args = new Array(this.args.length);
    for (let idx = 0, len = args.length; idx < len; idx++) {
      const arg = this.args[idx];
      args[idx] = arg instanceof PDFObject ? arg.clone(context) : arg;
    }
    return PDFOperator.of(this.name, args);
  }

  async toString(): Promise<string> {
    let value = "";
    for (let idx = 0, len = this.args.length; idx < len; idx++) {
      value += String(this.args[idx]) + " ";
    }
    value += this.name;
    return value;
  }

  async sizeInBytes(): Promise<number> {
    let size = 0;
    for (let idx = 0, len = this.args.length; idx < len; idx++) {
      const arg = this.args[idx];
      size +=
        (arg instanceof PDFObject ? await arg.sizeInBytes() : arg.length) + 1;
    }
    size += this.name.length;
    return size;
  }

  async copyBytesInto(buffer: Uint8Array, offset: number): Promise<number> {
    const initialOffset = offset;

    for (let idx = 0, len = this.args.length; idx < len; idx++) {
      const arg = this.args[idx];
      if (arg instanceof PDFObject) {
        offset += await arg.copyBytesInto(buffer, offset);
      } else {
        offset += copyStringIntoBuffer(arg, buffer, offset);
      }
      buffer[offset++] = CharCodes.Space;
    }

    offset += copyStringIntoBuffer(this.name, buffer, offset);

    return offset - initialOffset;
  }
}

export default PDFOperator;
