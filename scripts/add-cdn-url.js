// scripts/add-cdn-urls.js
import fs from "fs";
import path from "path";

const REPO_OWNER = "ullaskunder3";
const REPO_NAME = "project-api";
const BRANCH = "main";

const basePath = path.join("data", "details");
const cdnBase = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/data/images/projects/`;

fs.readdirSync(basePath).forEach((file) => {
  if (!file.endsWith(".json")) return;

  const filePath = path.join(basePath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (Array.isArray(data)) {
    data.forEach((item) => {
      // Update coverImage
      if (item.coverImage && !item.coverImage.startsWith("http")) {
        const filename = path.basename(item.coverImage);
        item.coverImage = cdnBase + filename;
      }

      // Update images array
      if (item.images && Array.isArray(item.images)) {
        item.images = item.images.map((img) => {
          if (!img.url.startsWith("http")) {
            const filename = path.basename(img.url);
            return { ...img, url: cdnBase + filename };
          }
          return img;
        });
      }
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  console.log(`Updated ${file}`);
});
