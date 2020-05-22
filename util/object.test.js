const { renameKey } = require("./object");

describe("Change keys", () => {
  it("should change _id to id", () => {
    const obj = { _id: "39284958495", "name": "somename" };
    const newobj = renameKey(obj, "_id", "id");
    const expected = { id: "39284958495", "name": "somename" };
    expect(newobj).toEqual(expected);
  });

  it("should handle nested changes to multiple keys", () => {
    const obj = { _id: "39284958495", "name": "somename" };
    const newobj = renameKey(renameKey(obj, "name", "NAME"), "_id", "id");
    const expected = { id: "39284958495", "NAME": "somename" };
    expect(newobj).toEqual(expected);
  });

  it("should not change empty object", () => {
    const obj = {};
    const newobj = renameKey(obj, "_id", "id");
    const expected = {};
    expect(newobj).toEqual(expected);
  });

  it("should return undefined object as undefined", () => {
    const obj = undefined;
    const newobj = renameKey(obj, "_id", "id");
    expect(newobj).toEqual(undefined);
  });
});

