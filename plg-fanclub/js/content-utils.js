(() => {
  const toDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (value) => {
    const parsed = toDate(value);
    if (!parsed) return "";
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const slugifyCategory = (value = "") =>
    String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const stripQuotes = (value) => {
    const trimmed = value.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  };

  const parseFrontmatter = (rawText) => {
    const frontmatterMatch = rawText.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!frontmatterMatch) {
      return {
        data: {},
        body: rawText,
      };
    }

    const [, frontmatter, body] = frontmatterMatch;
    const lines = frontmatter.split(/\r?\n/);
    const data = {};

    lines.forEach((line) => {
      if (!line || line.trim().startsWith("#")) return;
      const delimiterIndex = line.indexOf(":");
      if (delimiterIndex < 0) return;
      const key = line.slice(0, delimiterIndex).trim();
      const value = line.slice(delimiterIndex + 1);
      data[key] = stripQuotes(value);
    });

    return { data, body };
  };

  const escapeHtml = (value = "") =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const inlineMarkdownToHtml = (value) =>
    value
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  const markdownToHtml = (rawMarkdown = "") => {
    const lines = rawMarkdown.split(/\r?\n/);
    const html = [];
    let inList = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        return;
      }

      if (trimmed.startsWith("### ")) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        html.push(`<h4>${inlineMarkdownToHtml(escapeHtml(trimmed.slice(4)))}</h4>`);
        return;
      }

      if (trimmed.startsWith("## ")) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        html.push(`<h3>${inlineMarkdownToHtml(escapeHtml(trimmed.slice(3)))}</h3>`);
        return;
      }

      if (trimmed.startsWith("# ")) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        html.push(`<h2>${inlineMarkdownToHtml(escapeHtml(trimmed.slice(2)))}</h2>`);
        return;
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList) {
          html.push("<ul>");
          inList = true;
        }
        html.push(`<li>${inlineMarkdownToHtml(escapeHtml(trimmed.slice(2)))}</li>`);
        return;
      }

      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<p>${inlineMarkdownToHtml(escapeHtml(trimmed))}</p>`);
    });

    if (inList) {
      html.push("</ul>");
    }

    return html.join("");
  };

  const markdownToPlainText = (markdown) =>
    markdown
      .replace(/!\[[^\]]*]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
      .replace(/[`*_>#-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const parseDirectoryLinks = (html, folderPath) => {
    const matches = Array.from(html.matchAll(/href="([^"]+)"/g)).map((match) => match[1]);
    const files = matches
      .filter((href) => href.endsWith(".md") || href.endsWith(".markdown"))
      .map((href) => {
        if (href.startsWith("http")) return href;
        if (href.startsWith("/")) return href;
        const cleanFolder = folderPath.replace(/\/+$/, "");
        return `${cleanFolder}/${href.replace(/^\.?\//, "")}`;
      });
    return Array.from(new Set(files));
  };

  const fetchJsonList = async (folderPath) => {
    const response = await fetch(`${folderPath}/index.json`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const payload = await response.json();
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.files)) return payload.files;
    return [];
  };

  const discoverMarkdownFiles = async (folderPath) => {
    const cleanFolder = folderPath.replace(/\/+$/, "");
    const fromIndex = await fetchJsonList(cleanFolder).catch(() => []);
    const normalizedFromIndex = fromIndex
      .filter((file) => typeof file === "string" && (file.endsWith(".md") || file.endsWith(".markdown")))
      .map((file) => (file.startsWith("/") ? file : `${cleanFolder}/${file.replace(/^\.?\//, "")}`));

    if (normalizedFromIndex.length) {
      return Array.from(new Set(normalizedFromIndex));
    }

    const listingResponse = await fetch(`${cleanFolder}/`, { cache: "no-store" }).catch(() => null);
    if (!listingResponse || !listingResponse.ok) return [];
    const listingHtml = await listingResponse.text();
    return parseDirectoryLinks(listingHtml, cleanFolder);
  };

  const loadCollection = async (folderPath) => {
    const files = await discoverMarkdownFiles(folderPath);
    if (!files.length) return [];

    const entries = await Promise.all(
      files.map(async (filePath) => {
        const response = await fetch(filePath, { cache: "no-store" });
        if (!response.ok) return null;
        const raw = await response.text();
        const parsed = parseFrontmatter(raw);
        return {
          filePath,
          slug: filePath.split("/").pop().replace(/\.(md|markdown)$/i, ""),
          data: parsed.data,
          body: parsed.body.trim(),
        };
      })
    );

    return entries.filter(Boolean);
  };

  window.PLGContent = {
    escapeHtml,
    formatDate,
    loadCollection,
    markdownToHtml,
    markdownToPlainText,
    slugifyCategory,
    toDate,
  };
})();
