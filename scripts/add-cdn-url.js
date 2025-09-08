// scripts/add-cdn-urls.js
import fs from "fs";
import path from "path";

const REPO_OWNER = "ullaskunder3";
const REPO_NAME = "project-api";
const BRANCH = "main";

const cdnBase = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/data/images/projects/`;

// Helper to update a single JSON file (array or object)
function updateFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const updateItem = (item) => {
    // Update coverImage
    if (item.coverImage && !item.coverImage.startsWith("http")) {
      const filename = path.basename(item.coverImage);
      item.coverImage = cdnBase + filename;
    }

    // Update images array (if exists)
    if (item.images && Array.isArray(item.images)) {
      item.images = item.images.map((img) => {
        if (!img.url.startsWith("http")) {
          const filename = path.basename(img.url);
          return { ...img, url: cdnBase + filename };
        }
        return img;
      });
    }
  };

  if (Array.isArray(data)) {
    data.forEach(updateItem);
  } else if (typeof data === "object" && data !== null) {
    updateItem(data);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  console.log(`Updated ${filePath}`);
}

// Update all files in data/details/
const detailsPath = path.join("data", "details");
fs.readdirSync(detailsPath).forEach((file) => {
  if (!file.endsWith(".json")) return;
  updateFile(path.join(detailsPath, file));
});

// Update projects.json
const projectsFile = path.join("data", "projects.json");
if (fs.existsSync(projectsFile)) {
  updateFile(projectsFile);
}
