import z from "zod";

// MARK: FORMATTING METADATA ------------------------------------------------------------

async function getMetadata(glob: Record<string, () => Promise<unknown>>) {
  const metaPromises = Object.entries(glob).map(async ([slug, content]) => {
    const id = slug.split("/").at(-2);

    if (!id) {
      const msg = `[SHDR]: could not derive an id for ${slug} when importing meta.json`;
      throw new Error(msg);
    }

    const res = DefaultImportSchema.parse(await content());
    const data = await JSON.parse(res.default);
    const parsed = parseMetadata(data, id);
    return [id, parsed] as const;
  });
  const metaArrays = await Promise.all(metaPromises);
  return Object.fromEntries(metaArrays);
}

const DefaultImportSchema = z.object({
  default: z.string(),
});

const MetaSchema = z.object({
  imgSrc: z.string(),
});

function parseMetadata(data: unknown, id: string) {
  return MetaSchema.parse(data);
}

export { getMetadata };
