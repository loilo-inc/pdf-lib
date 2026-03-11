import { describe, expect, it } from "vitest";
import {
  mergeIntoTypedArray,
  PDFContext,
  PDFHexString,
  PDFObject,
  PDFObjectStream,
  PDFRef,
  PDFString,
  toCharCode,
  typedArrayFor,
} from "../../../src/index";
import { deflateAsync } from "../../../src/utils/deflate";

describe(`PDFObjectStream`, () => {
  const context = PDFContext.create();

  const objects: [PDFRef, PDFObject][] = [
    [context.nextRef(), context.obj([])],
    [context.nextRef(), context.obj(true)],
    [context.nextRef(), context.obj({})],
    [context.nextRef(), PDFHexString.of("ABC123")],
    [context.nextRef(), PDFRef.of(21)],
    [context.nextRef(), context.obj("QuxBaz")],
    [context.nextRef(), context.obj(null)],
    [context.nextRef(), context.obj(21)],
    [context.nextRef(), PDFString.of("Stuff and thingz")],
  ];

  it(`can be constructed from PDFObjectStream.of(...)`, () => {
    expect(
      PDFObjectStream.withContextAndObjects(context, objects, false),
    ).toBeInstanceOf(PDFObjectStream);
  });

  it(`can be cloned`, async () => {
    const original = await PDFObjectStream.withContextAndObjects(
      context,
      objects,
      false,
    );
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(await clone.toString()).toBe(await original.toString());
  });

  it(`can be converted to a string`, async () => {
    expect(
      await PDFObjectStream.withContextAndObjects(
        context,
        objects,
        false,
      ).toString(),
    ).toEqual(
      "<<\n/Type /ObjStm\n/N 9\n/Length 108\n/First 42\n>>\n" +
        "stream\n" +
        "1 0 2 4 3 9 4 15 5 24 6 31 7 39 8 44 9 47 " +
        "[ ]\n" +
        "true\n" +
        "<<\n>>\n" +
        "<ABC123>\n" +
        "21 0 R\n" +
        "/QuxBaz\n" +
        "null\n" +
        "21\n" +
        "(Stuff and thingz)\n" +
        "\nendstream",
    );
  });

  it(`can provide its size in bytes`, async () => {
    expect(
      await PDFObjectStream.withContextAndObjects(
        context,
        objects,
        false,
      ).sizeInBytes(),
    ).toBe(172);
  });

  it(`can be serialized`, async () => {
    const stream = PDFObjectStream.withContextAndObjects(
      context,
      objects,
      false,
    );
    const size = await stream.sizeInBytes();
    const buffer = new Uint8Array(size + 3).fill(toCharCode(" "));
    expect(await stream.copyBytesInto(buffer, 2)).toBe(172);
    expect(buffer).toEqual(
      typedArrayFor(
        "  <<\n/Type /ObjStm\n/N 9\n/Length 108\n/First 42\n>>\n" +
          "stream\n" +
          "1 0 2 4 3 9 4 15 5 24 6 31 7 39 8 44 9 47 " +
          "[ ]\n" +
          "true\n" +
          "<<\n>>\n" +
          "<ABC123>\n" +
          "21 0 R\n" +
          "/QuxBaz\n" +
          "null\n" +
          "21\n" +
          "(Stuff and thingz)\n" +
          "\nendstream ",
      ),
    );
  });

  it(`can be serialized when encoded`, async () => {
    const contents =
      "1 0 2 4 3 9 4 15 5 24 6 31 7 39 8 44 9 47 " +
      "[ ]\n" +
      "true\n" +
      "<<\n>>\n" +
      "<ABC123>\n" +
      "21 0 R\n" +
      "/QuxBaz\n" +
      "null\n" +
      "21\n" +
      "(Stuff and thingz)\n";
    const encodedContents = await deflateAsync(contents);

    const stream = PDFObjectStream.withContextAndObjects(
      context,
      objects,
      true,
    );
    const size = await stream.sizeInBytes();
    const buffer = new Uint8Array(size + 3).fill(toCharCode(" "));
    expect(await stream.copyBytesInto(buffer, 2)).toBe(195);
    expect(buffer).toEqual(
      mergeIntoTypedArray(
        "  <<\n/Filter /FlateDecode\n/Type /ObjStm\n/N 9\n/Length 110\n/First 42\n>>\n",
        "stream\n",
        encodedContents,
        "\nendstream ",
      ),
    );
  });
});
