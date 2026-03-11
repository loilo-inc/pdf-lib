import { copyStringIntoBuffer, last } from "../../utils";
import { AsyncCache } from "../../utils/async-cache";
import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
import PDFObject from "../objects/PDFObject";
import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
import CharCodes from "../syntax/CharCodes";
import PDFFlateStream from "./PDFFlateStream";

export type IndirectObject = [PDFRef, PDFObject];

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
    this.offsets = AsyncCache.populatedBy(this.computeObjectOffsets);
    this.offsetsString = AsyncCache.populatedBy(this.computeOffsetsString);

    this.dict.set(PDFName.of("Type"), PDFName.of("ObjStm"));
    this.dict.set(PDFName.of("N"), PDFNumber.of(this.objects.length));
  }

  getObjectsCount(): number {
    return this.objects.length;
  }

  clone(context?: PDFContext): PDFObjectStream {
    return PDFObjectStream.withContextAndObjects(
      context || this.dict.context,
      this.objects.slice(),
      this.encode,
    );
  }

  async updateDict(): Promise<void> {
    await super.updateDict();
    const offsetsString = await this.offsetsString.access();
    this.dict.set(PDFName.of("First"), PDFNumber.of(offsetsString.length));
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
    const buffer = new Uint8Array(await this.getUnencodedContentsSize());
    let offset = copyStringIntoBuffer(
      await this.offsetsString.access(),
      buffer,
      0,
    );
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [, object] = this.objects[idx];
      offset += await object.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }
    return buffer;
  }

  async getUnencodedContentsSize(): Promise<number> {
    const offsets = await this.offsets.access();
    const objects = await last(this.objects)[1].sizeInBytes();
    const offsetsString = await this.offsetsString.access();
    return offsetsString.length + last(offsets)[1] + objects + 1;
  }

  private async computeOffsetsString(): Promise<string> {
    let offsetsString = "";
    const offsets = await this.offsets.access();
    for (let idx = 0, len = offsets.length; idx < len; idx++) {
      const [objectNumber, offset] = offsets[idx];
      offsetsString += `${objectNumber} ${offset} `;
    }
    return offsetsString;
  }

  private async computeObjectOffsets(): Promise<[number, number][]> {
    let offset = 0;
    const offsets = new Array(this.objects.length);
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [ref, object] = this.objects[idx];
      offsets[idx] = [ref.objectNumber, offset];
      offset += (await object.sizeInBytes()) + 1; // '\n'
    }
    return offsets;
  }
}

export default PDFObjectStream;
