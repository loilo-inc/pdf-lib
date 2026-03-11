import { copyStringIntoBuffer } from "../../utils";
import { PrivateConstructorError } from "../errors";
import PDFObject from "./PDFObject";

const ENFORCER = {};
const pool = new Map<string, PDFRef>();

class PDFRef extends PDFObject {
  static of = (objectNumber: number, generationNumber = 0) => {
    const tag = `${objectNumber} ${generationNumber} R`;

    let instance = pool.get(tag);
    if (!instance) {
      instance = new PDFRef(ENFORCER, objectNumber, generationNumber);
      pool.set(tag, instance);
    }

    return instance;
  };

  readonly objectNumber: number;
  readonly generationNumber: number;
  readonly tag: string;

  private constructor(
    enforcer: any,
    objectNumber: number,
    generationNumber: number,
  ) {
    if (enforcer !== ENFORCER) throw new PrivateConstructorError("PDFRef");
    super();
    this.objectNumber = objectNumber;
    this.generationNumber = generationNumber;
    this.tag = `${objectNumber} ${generationNumber} R`;
  }

  clone(): PDFRef {
    return this;
  }

  async toString(): Promise<string> {
    return this.tag;
  }

  async sizeInBytes(): Promise<number> {
    return this.tag.length;
  }

  async copyBytesInto(buffer: Uint8Array, offset: number): Promise<number> {
    offset += copyStringIntoBuffer(this.tag, buffer, offset);
    return this.tag.length;
  }
}

export default PDFRef;
