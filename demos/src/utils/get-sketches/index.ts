import * as z from "zod";

type GlobImport = Record<string, () => Promise<unknown>>;

// MARK: FORMATTING METADATA ------------------------------------------------------------

async function getMetadata(glob: GlobImport) {
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

function parseMetadata(data: unknown, id: string) {
  return MetaSchema.parse(data);
}

const DefaultImportSchema = z.object({
  default: z.string(),
});

const MetaSchema = z.object({
  imgSrc: z.string(),
});

type SketchMetadata = z.infer<typeof MetaSchema>;

// MARK: FORMATTING METADATA ------------------------------------------------------------

async function getSketches(sketchGlob: GlobImport, metaGlob: GlobImport) {
  const paths = Object.keys(sketchGlob);
  const metadata = await getMetadata(metaGlob);

  return paths
    .map((path) => {
      const segments = path.split("/");

      const id = segments.at(-2);
      const label = formatPathSegment(id);
      const categoryId = segments.at(-3);
      const categoryLabel = formatPathSegment(categoryId);

      const href = segments.reduce<string>((acc, seg, i) => {
        if (i <= 2 || i === segments.length - 1) {
          return acc;
        }
        return `${acc}/${seg}`;
      }, "");

      const data = metadata[id ?? ""];
      const imgSrc = data?.imgSrc ?? `/sketch-thumbnails/${id}.png`;

      return {
        id,
        href,
        category: { id: categoryId, label: categoryLabel },
        label,
        imgSrc,
      };
    })
    .filter(
      (path) => !path.href.includes("_archive") && !path.id?.startsWith("_")
    );
}

function formatPathSegment(seg?: string) {
  return seg
    ?.split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export { getSketches, formatPathSegment, getMetadata, type SketchMetadata };
