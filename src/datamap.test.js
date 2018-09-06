import Datamap from "./datamap";

test("Generates correct number of chunks", () => {
  const chunksCount = 3; // Adds an extra meta chunk
  const datamap = Datamap.generate("handle123", chunksCount);

  expect(Object.keys(datamap).length).toBe(chunksCount + 1);
});

test("Generates correct number of chunks with treasure", () => {
  const opts = { includeTreasureOffsets: true };
  const chunksCount = 3; // Adds an extra meta chunk and another for treasure.
  const datamap = Datamap.generate("handle123", chunksCount, opts);

  expect(Object.keys(datamap).length).toBe(chunksCount + 2);
});

test("Compares new generate raw to old", () => {
  const chunksCount = 3;
  const handle = "handle123";
  const datamapRaw = Object.entries(Datamap.generate(handle, chunksCount, { raw: true }));

  expect(JSON.stringify(datamapRaw)).toEqual(JSON.stringify([["0","handle123"],["1","«\r i.?\u0017²\u001d\u0000É`ß1$á¡Ö2a¥è|·tT­©@\u0010"],["2","\fì\u001cï\u001cë®Ôònæ\u0012¯°yv\u001dZ»l­\u0001¦]ì@\u0000"],["3","Å1óR\fNñfû\t¤¯lÇ\u0019£¡gIë\nXû~×Ý"]]));
});
