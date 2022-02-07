import assert from "assert";
import TruffleConfig from "../dist";
import { describe, it } from "mocha";
import path from "path";

describe("TruffleConfig unit tests", async () => {
  describe("with", async () => {
    let options = { config: path.join(".", "test", "truffle-config.js") };
    let truffleConfig: TruffleConfig;

    beforeEach(() => {
      // TODO:
      // who creates ./test/truffle-config.js?
      // why does this not fail?
      truffleConfig = TruffleConfig.detect(options);
    });

    it("handles a simple object", async () => {
      const expectedRandom = 42;
      const expectedFoo = "bar";
      const obj = {
        random: expectedRandom,
        foo: expectedFoo
      };
      const newConfig = truffleConfig.with(obj);
      assert.equal(expectedRandom, newConfig.random);
      assert.equal(expectedFoo, newConfig.foo);
    });

    it("overwrites a known property", () => {
      const expectedProvider = { a: "propertyA", b: "propertyB" };
      const newConfig = truffleConfig.with({ provider: expectedProvider });
      assert.deepEqual(expectedProvider, newConfig.provider);
    });

    it("overwrites with a class property", () => {
      const expectedId = 13;
      const expectedString = "prototype!";
      class SpecialProvider {
        constructor(private specialId: number) {}
        whoami() {
          return expectedString;
        }
      }

      const specialProvider = new SpecialProvider(expectedId);
      const newProvider = { provider: specialProvider };
      const newConfig = truffleConfig.with(newProvider);

      assert.equal(expectedString, newConfig.provider.whoami());
      assert.equal(expectedId, newConfig.provider.specialId);
    });

    it("overwrites a class with a shadowed property", () => {
      const expectedId = 13;
      const expectedString = "from the shadows, for instance";
      class SpecialProvider {
        constructor(private specialId: number) {}
        whoami() {
          return "prototype! Where's my shadow?";
        }
      }

      const specialProvider = new SpecialProvider(expectedId);
      specialProvider.whoami = function () {
        return expectedString;
      };

      const newProvider = { provider: specialProvider };
      const newConfig = truffleConfig.with(newProvider);
      assert.equal(expectedString, newConfig.provider.whoami());
      assert.equal(expectedId, newConfig.provider.specialId);
    });
  });
});
