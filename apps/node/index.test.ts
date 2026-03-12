import { describe, expect, test } from "vitest";
import { assets } from ".";
import test1 from "./tests/test1";
import test10 from "./tests/test10";
import test11 from "./tests/test11";
import test12 from "./tests/test12";
import test13 from "./tests/test13";
import test14 from "./tests/test14";
import test15 from "./tests/test15";
import test16 from "./tests/test16";
import test17 from "./tests/test17";
import test18 from "./tests/test18";
import test2 from "./tests/test2";
import test3 from "./tests/test3";
import test4 from "./tests/test4";
import test5 from "./tests/test5";
import test6 from "./tests/test6";
import test7 from "./tests/test7";
import test8 from "./tests/test8";
import test9 from "./tests/test9";

import fs from "fs";
import path from "path";

describe("node integration test", () => {
  const tests = [
    test1,
    test2,
    test3,
    test4,
    test5,
    test6,
    test7,
    test8,
    test9,
    test10,
    test11,
    test12,
    test13,
    test14,
    test15,
    test16,
    test17,
    test18,
  ];

  expect.addSnapshotSerializer({
    test: (val) => val instanceof Uint8Array,
    serialize: (val) => new TextDecoder().decode(val),
  });
  test.each(tests.map((test, idx) => [idx + 1, test]))(
    "test%d",
    async (_idx, test) => {
      const pdfBytes = await test(assets);
      const outfile = path.join(__dirname, `./__snapshots__/test${_idx}.pdf`);
      if (!fs.existsSync(outfile)) {
        await fs.promises.writeFile(outfile, pdfBytes);
      } else {
        const expectedBytes = await fs.promises.readFile(outfile);
        const decoder = new TextDecoder();
        expect(decoder.decode(pdfBytes)).toEqual(decoder.decode(expectedBytes));
      }
    },
  );
});
