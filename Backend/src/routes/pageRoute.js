import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_DIR = path.join(__dirname, "../../../Frontend/HTML");

// clean url -> html file
const pages = {
  "/": "index.html",
  "/about": "about.html",
  "/login": "login.html",
  "/sign-up": "sign-up.html",
  "/patient-dashboard": "patient-dashboard.html",
  "/doctor-dashboard": "doctor-dashboard.html",
  "/appointments": "appointment.html",
  "/medical-records": "medical-records.html",
  "/health-vault": "health-vault.html",
  "/patient-directory": "patient-directory.html",
};

for (const [url, file] of Object.entries(pages)) {
  router.get(url, (req, res) => res.sendFile(path.join(HTML_DIR, file)));
}

// old /Frontend/HTML/x.html links -> 301 to the clean url (keeps #hash anchors working)
router.get("/Frontend/HTML/:file", (req, res, next) => {
  const url = Object.keys(pages).find((u) => pages[u] === req.params.file);
  url ? res.redirect(301, url) : next();
});

export default router;