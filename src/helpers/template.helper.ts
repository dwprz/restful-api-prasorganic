import fs from "fs";
import mustache from "mustache";

export class TemplateHelper {
  static render(path: string, view: any) {
    let template = fs.readFileSync(path, "utf-8");

    template = mustache.render(template, view);
    return template;
  }
}
