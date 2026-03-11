import { AsyncCache } from "../../utils/async-cache";
import { deflateAsync } from "../../utils/deflate";
import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import { PDFAsyncStream } from "../objects/PDFStream";

abstract class PDFFlateStream extends PDFAsyncStream {
  protected readonly contentsCache: AsyncCache<Uint8Array>;
  protected readonly encode: boolean;

  protected constructor(dict: PDFDict, encode: boolean) {
    super(dict);

    this.encode = encode;

    if (encode) dict.set(PDFName.of("Filter"), PDFName.of("FlateDecode"));
    this.contentsCache = new AsyncCache(this.computeContents);
  }

  private readonly computeContents = async (): Promise<Uint8Array> => {
    const unencodedContents = this.getUnencodedContents();
    return this.encode
      ? unencodedContents.then(deflateAsync)
      : unencodedContents;
  };

  async getContents(): Promise<Uint8Array> {
    return this.contentsCache.access();
  }

  async getContentsSize(): Promise<number> {
    return (await this.contentsCache.access()).length;
  }

  abstract getUnencodedContents(): Promise<Uint8Array>;
}

export default PDFFlateStream;
