import raw from "./models.json";

export type ModelRow = {
  id: string;
  name: string;
  descRu: string;
  descEn: string;
  colors: string;
  styling: string;
  salesRu: string;
  salesEn: string;
  objRu: string;
  objEn: string;
};

export const models: ModelRow[] = (raw as ModelRow[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name));
