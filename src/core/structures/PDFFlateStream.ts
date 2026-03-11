import { AsyncCache } from "../../utils/async-cache";
import { deflateAsync } from "../../utils/deflate";
import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import PDFStream from "../objects/PDFStream";

abstract class PDFFlateStream extends PDFStream {
  protected readonly contentsCache: AsyncCache<Uint8Array>;
  protected readonly encode: boolean;

  constructor(dict: PDFDict, encode: boolean) {
    super(dict);

    this.encode = encode;

    if (encode) dict.set(PDFName.of("Filter"), PDFName.of("FlateDecode"));
    this.contentsCache = AsyncCache.populatedBy(this.computeContents);
  }

  private computeContents = async (): Promise<Uint8Array> => {
    const unencodedContents = await this.getUnencodedContents();
    return this.encode ? deflateAsync(unencodedContents) : unencodedContents;
  };

  getContents(): Promise<Uint8Array> {
    return this.contentsCache.access();
  }

  async getContentsSize(): Promise<number> {
    const contents = await this.getContents();
    return contents.length;
  }

  abstract getUnencodedContents(): Promise<Uint8Array>;
}

export default PDFFlateStream;
