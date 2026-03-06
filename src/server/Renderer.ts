import ejs from "ejs";
import fs from "fs/promises";
import path from "path";

export const renderData = {
    urlFor(p: string): string {
        return path.join("/", "static", p).replace(/\\/g, "/");
    }
};

export async function renderTemplate(file: string, data: any = {}) {
    const templatePath = path.join(__dirname, "../client/", file);
    return ejs.render(await fs.readFile(templatePath, "utf8"), { ...data , ...renderData }, { async: true });
}