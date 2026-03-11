// import PDFObject from "../objects/PDFObject";
// import PDFContext from "../PDFContext";

// // class PDFResolvedStream extends PDFObject {
// //   constructor(
// //     readonly contentString: string,
// //     readonly sizeInBytes: number,
// //   ) {
// //     super();
// //   }
// //   clone(_context?: PDFContext): PDFObject {
// //     throw new Error("Method not implemented.");
// //   }
// //   toString(): string {
// //     await this.updateDict();
// //     let streamString = this.dict.toString();
// //     streamString += "\nstream\n";
// //     streamString += await this.getContentsString();
// //     streamString += "\nendstream";
// //     return streamString;
// //   }
// //   sizeInBytes(): number {
// //     return this.sizeInBytes;
// //   }
// //   copyBytesInto(_buffer: Uint8Array, _offset: number): number {
// //     throw new Error("Method not implemented.");
// //   }
// // }
