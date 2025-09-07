#!/usr/bin/env node
import fs from "fs";
import path from "path";

const PROJECTS_JSON = path.join(process.cwd(), "data/projects.json");
const DETAILS_DIR = path.join(process.cwd(), "data/details");

const readProjects = () => {
  if (!fs.existsSync(PROJECTS_JSON)) return [];
  const content = fs.readFileSync(PROJECTS_JSON, "utf-8");
  return JSON.parse(content);
};

const writeProjects = (projects) => {
  fs.writeFileSync(PROJECTS_JSON, JSON.stringify(projects, null, 2), "utf-8");
};

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// --- CLI Args ---
const args = process.argv.slice(2);
if (!args.length) {
  console.error("❌ Please provide a project title.");
  process.exit(1);
}

const title = args[0];

// Optional fields
const summaryArg = args.find((arg) => arg.startsWith("--summary="));
const summary = summaryArg ? summaryArg.split("=")[1] : "";

const tagsArg = args.find((arg) => arg.startsWith("--tags="));
const tags = tagsArg
  ? tagsArg
      .split("=")[1]
      .split(",")
      .map((t) => t.trim())
  : [];

const coverArg = args.find((arg) => arg.startsWith("--cover="));
const coverImage = coverArg ? coverArg.split("=")[1] : "";

const dateArg = args.find((arg) => arg.startsWith("--date="));
let date;
if (dateArg) {
  date = dateArg.split("=")[1];
} else {
  const now = new Date();
  date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

// --- Generate ID and Slug ---
const projects = readProjects();
const slug = slugify(title);

// Check if project already exists
if (projects.find((p) => p.slug === slug)) {
  console.error(`❌ Project with slug "${slug}" already exists!`);
  process.exit(1);
}

const id = projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 1;

// --- New Project Object for projects.json ---
const newProject = {
  id,
  title,
  slug,
  summary,
  date,
  coverImage,
  tags,
};

// --- Ensure details directory exists ---
if (!fs.existsSync(DETAILS_DIR)) {
  fs.mkdirSync(DETAILS_DIR, { recursive: true });
}

// --- Create detail JSON file with full boilerplate ---
const detailFilePath = path.join(DETAILS_DIR, `${slug}.json`);
const defaultDetail = {
  id,
  featured: false,
  slug,
  title,
  summary,
  achievements: [],
  websiteUrl: "",
  technologies: tags,
  coverImage,
  images: [],
  date,
  role: "",
  description: "",
};
fs.writeFileSync(
  detailFilePath,
  JSON.stringify(defaultDetail, null, 2),
  "utf-8"
);

projects.push(newProject);
writeProjects(projects);

console.log(`✅ New project added: ${title} (id: ${id}, slug: ${slug})`);
console.log(`✅ Detail file created: data/details/${slug}.json`);
