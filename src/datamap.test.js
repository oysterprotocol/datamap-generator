import { generate } from "./datamap";

test("Generates correct number of chunks", () => {
  const chunksCount = 3; // Adds an extra meta chunk
  const datamap = generate("handle123", chunksCount);

  expect(Object.keys(datamap).length).toBe(chunksCount + 1);
});
