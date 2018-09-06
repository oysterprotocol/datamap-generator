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

test("Generates correct number of chunks with raw datamap", () => {
  const chunksCount = 3;
  const handle = "handle123";
  const datamapRaw = Object.entries(Datamap.generate(handle, chunksCount, { raw: true }));

  expect(datamapRaw.length).toEqual(chunksCount + 1)
});
