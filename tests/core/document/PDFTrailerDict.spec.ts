import { describe, expect, it } from "vitest";
import { PDFContext, PDFTrailerDict } from "../../../src/core";
import { toCharCode, typedArrayFor } from "../../../src/utils";

describe(`PDFTrailerDict`, () => {
  const dict = PDFContext.create().obj({ Foo: "Bar" });

  it(`can be constructed from PDFTrailerDict.of(...)`, () => {
    expect(PDFTrailerDict.of(dict)).toBeInstanceOf(PDFTrailerDict);
  });

  it(`can be converted to a string`, async () => {
    await expect(PDFTrailerDict.of(dict).toString()).resolves.toBe(
      "trailer\n<<\n/Foo /Bar\n>>",
    );
  });

  it(`can provide its size in bytes`, async () => {
    await expect(PDFTrailerDict.of(dict).sizeInBytes()).resolves.toBe(23);
  });

  it(`can be serialized`, async () => {
    const buffer = new Uint8Array(27).fill(toCharCode(" "));
    await expect(
      PDFTrailerDict.of(dict).copyBytesInto(buffer, 3),
    ).resolves.toBe(23);
    expect(buffer).toEqual(typedArrayFor("   trailer\n<<\n/Foo /Bar\n>> "));
  });
});
