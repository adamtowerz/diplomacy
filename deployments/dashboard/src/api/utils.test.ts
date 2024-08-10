import { constructQS } from "./utils";

describe("api-utils", () => {
  describe("constructQS", () => {
    it("should handle path slots correctly", () => {
      expect(
        constructQS({
          endpoint: "/abc/:id/:xyz",
          pathArgs: {
            id: "1",
            xyz: "2",
          },
        })
      ).toEqual("/abc/1/2");
    });
  });
});
