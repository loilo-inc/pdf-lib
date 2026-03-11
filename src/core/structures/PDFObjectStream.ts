import { copyStringIntoBuffer, last } from "../../utils";
import { AsyncCache } from "../../utils/async-cache";
import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
import PDFObject, { PDFAsyncObject } from "../objects/PDFObject";
import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
import CharCodes from "../syntax/CharCodes";
import PDFFlateStream from "./PDFFlateStream";

export type IndirectObject = [PDFRef, PDFObject | PDFAsyncObject];

class PDFObjectStream extends PDFFlateStream {
  static withContextAndObjects = (
    context: PDFContext,
    objects: IndirectObject[],
    encode = true,
  ) => new PDFObjectStream(context, objects, encode);

  private readonly objects: IndirectObject[];
  private readonly offsets: AsyncCache<[number, number][]>;
  private readonly offsetsString: AsyncCache<string>;

  private constructor(
    context: PDFContext,
    objects: IndirectObject[],
    encode = true,
  ) {
    super(context.obj({}), encode);

    this.objects = objects;
    this.offsets = new AsyncCache(this.computeObjectOffsets);
    this.offsetsString = new AsyncCache(this.computeOffsetsString);
    this.dict.set(PDFName.of("Type"), PDFName.of("ObjStm"));
    this.dict.set(PDFName.of("N"), PDFNumber.of(this.objects.length));
  }

  getObjectsCount(): number {
    return this.objects.length;
  }

  async updateDict(): Promise<void> {
    await super.updateDict();
    const offsetsString = await this.offsetsString.access();
    this.dict.set(PDFName.of("First"), PDFNumber.of(offsetsString.length));
  }

  clone(context?: PDFContext): PDFObjectStream {
    return PDFObjectStream.withContextAndObjects(
      context || this.dict.context,
      this.objects.slice(),
      this.encode,
    );
  }

  async getContentsString(): Promise<string> {
    let value = await this.offsetsString.access();
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [, object] = this.objects[idx];
      value += `${object}\n`;
    }
    return value;
  }

  async getUnencodedContents(): Promise<Uint8Array> {
    const contentsSize = await this.getUnencodedContentsSize();
    const buffer = new Uint8Array(contentsSize);
    const offsetsString = await this.offsetsString.access();
    let offset = copyStringIntoBuffer(offsetsString, buffer, 0);
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [, object] = this.objects[idx];
      offset += await object.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }
    return buffer;
  }

  async getUnencodedContentsSize(): Promise<number> {
    const offsetsString = await this.offsetsString.access();
    const lastOffset = (await this.offsets.access()).slice(-1)[0][1];
    const lastObjectSize = await last(this.objects)[1].sizeInBytes();
    return offsetsString.length + lastOffset + lastObjectSize + 1;
  }

  private computeOffsetsString = async (): Promise<string> => {
    let offsetsString = "";
    const offsets = await this.offsets.access();
    for (let idx = 0, len = offsets.length; idx < len; idx++) {
      const [objectNumber, offset] = offsets[idx];
      offsetsString += `${objectNumber} ${offset} `;
    }
    return offsetsString;
  };

  private computeObjectOffsets = async (): Promise<[number, number][]> => {
    let offset = 0;
    const offsets = new Array(this.objects.length);
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [ref, object] = this.objects[idx];
      offsets[idx] = [ref.objectNumber, offset];
      offset += (await object.sizeInBytes()) + 1; // '\n'
    }
    return offsets;
  };
}

export default PDFObjectStream;
