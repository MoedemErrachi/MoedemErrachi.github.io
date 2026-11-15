const SECTIONS = [
  { id: "profile", label: "Profile", count: null },
  { id: "about", label: "About", count: null },
  { id: "experience", label: "Experience", count: (c) => c.experience.length },
  { id: "headings", label: "Section headings", count: null },
  { id: "skills", label: "Skill groups", count: (c) => c.skills.length },
  { id: "hackathons", label: "Hackathons", count: (c) => c.hackathons.length },
  { id: "projects", label: "Projects", count: (c) => c.projects.length },
  { id: "education", label: "Education", count: (c) => c.education.length },
  { id: "seo", label: "SEO", count: null },
  { id: "media", label: "Media", count: () => state.assets.length },
  { id: "publish", label: "Publish", count: null },
];

const ICONS = ["github", "linkedin", "mail", "phone", "globe", "file"];
const SKILL_ICONS = ["backend", "frontend", "tools", "data", "ci", "ai"];

const state = {
  content: null,
  assets: [],
  git: null,
  publish: null,
  section: "profile",
  dirty: false,
  build: { running: false, code: null, log: [] },
};

const el = {
  nav: document.getElementById("nav"),
  editor: document.getElementById("editor"),
  title: document.getElementById("section-title"),
  subtitle: document.getElementById("section-subtitle"),
  save: document.getElementById("btn-save"),
  build: document.getElementById("btn-build"),
  publish: document.getElementById("btn-publish"),
  dirtyFlag: document.getElementById("dirty-flag"),
  preview: document.getElementById("preview"),
  refreshPreview: document.getElementById("btn-refresh-preview"),
  buildStatus: document.getElementById("build-status"),
  buildLog: document.getElementById("build-log"),
  repoBranch: document.getElementById("repo-branch"),
  toast: document.getElementById("toast"),
  dialog: document.getElementById("publish-dialog"),
  publishMessage: document.getElementById("publish-message"),
  publishBranch: document.getElementById("publish-branch"),
  publishFiles: document.getElementById("publish-files"),
};

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "value") node.value = value;
    else if (key === "checked") node.checked = Boolean(value);
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

let toastTimer = null;
function toast(message, kind = "ok") {
  el.toast.textContent = message;
  el.toast.className = `toast ${kind}`;
  el.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.hidden = true;
  }, 3800);
}

function setDirty(value) {
  state.dirty = value;
  el.dirtyFlag.hidden = !value;
}

function getPath(object, path) {
  return path.split(".").reduce((acc, key) => acc[key], object);
}

function setPath(object, path, value) {
  const keys = path.split(".");
  let target = object;
  for (let i = 0; i < keys.length - 1; i += 1) target = target[keys[i]];
  target[keys[keys.length - 1]] = value;
}

/**
 * Writes an edited value straight into the in-memory content so that reordering
 * or removing rows never loses unsaved edits.
 */
function bindValue(input, path) {
  const commit = () => {
    let value = input.type === "checkbox" ? input.checked : input.value;
    if (input.type === "number") {
      value = input.value === "" ? null : Number(value);
    }
    setPath(state.content, path, value);
    setDirty(true);
  };
  input.addEventListener("input", commit);
  input.addEventListener("change", commit);
}

function field(label, path, value, options = {}) {
  const input = options.textarea
    ? h("textarea", { "data-path": path }, [value ?? ""])
    : h("input", {
        "data-path": path,
        type: options.type || "text",
        value: value ?? "",
        placeholder: options.placeholder || "",
      });

  bindValue(input, path);

  return h("label", { class: "field" }, [
    h("span", { text: label }),
    input,
    options.hint ? h("small", { text: options.hint }) : null,
  ]);
}

function select(label, path, value, options) {
  const picker = h(
    "select",
    { "data-path": path },
    options.map((option) => h("option", { value: option }, [option])),
  );
  picker.value = value ?? options[0];
  bindValue(picker, path);
  return h("label", { class: "field" }, [h("span", { text: label }), picker]);
}

function tagList(label, path, values) {
  const tags = h("div", { class: "tag-input" });
  const input = h("input", {
    type: "text",
    placeholder: "Add and press Enter",
    style: "flex:1;min-width:110px;border:0;background:transparent;color:inherit;outline:none;font:inherit;",
  });

  const render = () => {
    tags.querySelectorAll(".tag").forEach((n) => n.remove());
    const list = getPath(state.content, path);
    list.forEach((item, index) => {
      tags.append(
        h("span", { class: "tag" }, [
          item,
          h(
            "button",
            {
              type: "button",
              title: "Remove",
              onclick: () => {
                getPath(state.content, path).splice(index, 1);
                render();
                setDirty(true);
              },
            },
            ["×"],
          ),
        ]),
      );
    });
  };

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    getPath(state.content, path).push(value);
    input.value = "";
    render();
    setDirty(true);
  });

  render();
  return h("label", { class: "field" }, [h("span", { text: label }), tags, input]);
}

function card(title, bodyChildren, actions = []) {
  return h("div", { class: "card" }, [
    h("div", { class: "card-head" }, [
      h("h3", { text: title }),
      h("div", { style: "display:flex;gap:6px;" }, actions),
    ]),
    h("div", { class: "card-body" }, bodyChildren),
  ]);
}

/** Multi-line text list (one textarea per line, add/remove) for bullets and highlights. */
function bulletList(label, path, values) {
  const wrap = h("div", { class: "field" }, [h("span", { text: label })]);

  const render = () => {
    wrap.querySelectorAll(".bullet-row").forEach((node) => node.remove());
    values.forEach((value, index) => {
      const textarea = h("textarea", { "data-path": `${path}.${index}` }, [value]);
      bindValue(textarea, `${path}.${index}`);
      wrap.append(
        h("div", { class: "bullet-row", style: "display:grid;gap:6px;margin-top:8px;" }, [
          textarea,
          h(
            "button",
            {
              class: "icon-btn",
              type: "button",
              title: "Remove line",
              onclick: () => {
                values.splice(index, 1);
                setDirty(true);
                render();
              },
            },
            ["×"],
          ),
        ]),
      );
    });
  };
  render();

  wrap.append(
    h(
      "button",
      {
        class: "btn btn-ghost",
        type: "button",
        onclick: () => {
          values.push("");
          setDirty(true);
          render();
        },
      },
      ["+ Add line"],
    ),
  );
  return wrap;
}

function repeatEditor(collection, { title, makeItem, itemLabel, fields }) {
  const wrap = h("div", {});
  const render = () => {
    wrap.textContent = "";
    const items = getPath(state.content, collection);
    if (!items.length) {
      wrap.append(h("p", { class: "empty", text: `No ${title.toLowerCase()} yet.` }));
    }
    items.forEach((item, index) => {
      wrap.append(
        h("div", { class: "card" }, [
          h("div", { class: "card-head" }, [
            h("h3", { text: itemLabel(item, index) }),
            h(
              "button",
              {
                class: "icon-btn",
                type: "button",
                title: "Remove",
                onclick: () => {
                  items.splice(index, 1);
                  setDirty(true);
                  render();
                },
              },
              ["×"],
            ),
          ]),
          h("div", { class: "card-body" }, fields(item, index, render)),
        ]),
      );
    });
  };
  render();

  return h("div", {}, [
    wrap,
    h(
      "button",
      {
        class: "btn btn-ghost",
        type: "button",
        onclick: () => {
          getPath(state.content, collection).push(makeItem());
          setDirty(true);
          render();
        },
      },
      [`+ Add ${title.toLowerCase().replace(/s$/, "")}`],
    ),
  ]);
}

function listEditor(collection, { title, makeItem, itemLabel, fields }) {
  const wrap = h("div", {});
  const render = () => {
    wrap.textContent = "";
    const items = state.content[collection];
    if (!items.length) {
      wrap.append(h("p", { class: "empty", text: `No ${title.toLowerCase()} yet.` }));
    }
    items.forEach((item, index) => {
      const head = h("div", { class: "card-head" }, [
        h("h3", { text: itemLabel(item, index) }),
        h("div", { style: "display:flex;gap:6px;" }, [
          h(
            "button",
            {
              class: "icon-btn",
              type: "button",
              title: "Move up",
              onclick: () => {
                if (index === 0) return;
                [items[index - 1], items[index]] = [items[index], items[index - 1]];
                setDirty(true);
                render();
              },
            },
            ["↑"],
          ),
          h(
            "button",
            {
              class: "icon-btn",
              type: "button",
              title: "Move down",
              onclick: () => {
                if (index === items.length - 1) return;
                [items[index + 1], items[index]] = [items[index], items[index + 1]];
                setDirty(true);
                render();
              },
            },
            ["↓"],
          ),
          h(
            "button",
            {
              class: "icon-btn",
              type: "button",
              title: "Remove",
              onclick: () => {
                items.splice(index, 1);
                setDirty(true);
                render();
              },
            },
            ["×"],
          ),
        ]),
      ]);

      wrap.append(
        h("div", { class: "card" }, [
          head,
          h("div", { class: "card-body" }, fields(item, index, render)),
        ]),
      );
    });
  };
  render();

  return h("div", {}, [
    wrap,
    h(
      "button",
      {
        class: "btn btn-ghost",
        type: "button",
        onclick: () => {
          state.content[collection].push(makeItem());
          setDirty(true);
          render();
        },
      },
      [`+ Add ${title.toLowerCase().replace(/s$/, "")}`],
    ),
  ]);
}

/* ------------------------------------------------------------------ */
/* sections                                                            */
/* ------------------------------------------------------------------ */

function renderProfile() {
  const profile = state.content.profile;

  const photo = h("div", { class: "photo-preview" }, [
    h("img", { src: profile.photo || "/photo.jpg", alt: "" }),
    h("div", { style: "flex:1;display:grid;gap:12px;" }, [
      field("Photo path", "profile.photo", profile.photo, {
        placeholder: "/photo.jpg",
        hint: "Files in /public are served from the site root.",
      }),
      h(
        "button",
        {
          class: "btn btn-ghost",
          type: "button",
          onclick: () => {
            const input = h("input", { type: "file", accept: "image/*" });
            input.click();
            input.addEventListener("change", async () => {
              const file = input.files?.[0];
              if (!file) return;
              const uploaded = await uploadFile(file);
              if (uploaded) {
                profile.photo = uploaded.path;
                setDirty(true);
                render();
              }
            });
          },
        },
        ["Upload new photo"],
      ),
    ]),
  ]);
  return [
    card("Identity", [
      field("Full name", "profile.name", profile.name),
      field("Role", "profile.role", profile.role),
      field("Tagline", "profile.tagline", profile.tagline),
      field("Hero label", "profile.heroLabel", profile.heroLabel, {
        hint: "Mono line in the hero eyebrow, e.g. FINAL SEASON — SEEKING A PFE SEAT.",
      }),
      field("Status chip", "profile.status", profile.status, {
        hint: "Small status line with the pulsing dot, e.g. ON TRACK — OPEN TO A PFE INTERNSHIP.",
      }),
      field("Summary", "profile.summary", profile.summary, { textarea: true }),
    ]),
    card("Contact", [
      field("Location", "profile.location", profile.location),
      field("Email", "profile.email", profile.email, { type: "email" }),
      field("Phone", "profile.phone", profile.phone, {
        type: "tel",
        placeholder: "+216 56 617 680",
        hint: "Leave empty to hide the phone line.",
      }),
    ]),
    card("Photo", [photo]),
    h("div", { class: "card" }, [
      h("div", { class: "card-head" }, [h("h3", { text: "CV files" })]),
      h("div", { class: "card-body" }, [
        repeatEditor("profile.resume", {
          title: "CV files",
          makeItem: () => ({ label: "Download CV", href: "/cv/" }),
          itemLabel: (item, index) => item.label || `File ${index + 1}`,
          fields: (item, index) => [
            field(`Label ${index + 1}`, `profile.resume.${index}.label`, item.label),
            field(`File ${index + 1}`, `profile.resume.${index}.href`, item.href, {
              placeholder: "/cv/errachi_cv_web_en.pdf",
            }),
          ],
        }),
      ]),
    ]),
    h("div", { class: "card" }, [
      h("div", { class: "card-head" }, [h("h3", { text: "Profile links" })]),
      h("div", { class: "card-body" }, [
        repeatEditor("profile.links", {
          title: "Links",
          makeItem: () => ({ label: "New link", href: "https://", icon: "globe" }),
          itemLabel: (item, index) => item.label || `Link ${index + 1}`,
          fields: (item, index) => [
            field(`Label ${index + 1}`, `profile.links.${index}.label`, item.label),
            field(`URL ${index + 1}`, `profile.links.${index}.href`, item.href),
            select(`Icon ${index + 1}`, `profile.links.${index}.icon`, item.icon, ICONS),
          ],
        }),
      ]),
    ]),
  ];
}

function renderAbout() {
  const about = state.content.about;

  const highlights = about.highlights.map((highlight, index) =>
    h("div", { class: "card" }, [
      h("div", { class: "card-head" }, [
        h("h3", { text: highlight.title || `Highlight ${index + 1}` }),
        h(
          "button",
          {
            class: "icon-btn",
            type: "button",
            title: "Remove",
            onclick: () => {
              about.highlights.splice(index, 1);
              setDirty(true);
              render();
            },
          },
          ["×"],
        ),
      ]),
      h("div", { class: "card-body" }, [
        field("Title", `about.highlights.${index}.title`, highlight.title),
        field("Text", `about.highlights.${index}.text`, highlight.text, {
          textarea: true,
        }),
        select("Icon", `about.highlights.${index}.icon`, highlight.icon, [
          "backend",
          "frontend",
          "tools",
          "trophy",
        ]),
      ]),
    ]),
  );

  const paragraphs = about.paragraphs.map((paragraph, index) => {
    const textarea = h("textarea", { "data-path": `about.paragraphs.${index}` }, [
      paragraph,
    ]);
    bindValue(textarea, `about.paragraphs.${index}`);
    return h("div", { class: "field" }, [
      h("span", { text: `Paragraph ${index + 1}` }),
      textarea,
      h(
        "button",
        {
          class: "icon-btn",
          type: "button",
          title: "Remove paragraph",
          onclick: () => {
            about.paragraphs.splice(index, 1);
            setDirty(true);
            render();
          },
        },
        ["×"],
      ),
    ]);
  });

  return [
    card("Heading", [
      field("Eyebrow", "about.eyebrow", about.eyebrow),
      field("Title", "about.title", about.title),
      field("Description", "about.description", about.description, { textarea: true }),
    ]),
    card("Paragraphs", [
      ...paragraphs,
      h(
        "button",
        {
          class: "btn btn-ghost",
          type: "button",
          onclick: () => {
            about.paragraphs.push("");
            setDirty(true);
            render();
          },
        },
        ["+ Add paragraph"],
      ),
    ]),
    h("div", { class: "card" }, [
      h("div", { class: "card-head" }, [h("h3", { text: "Highlights" })]),
      h("div", { class: "card-body" }, [
        ...highlights,
        h(
          "button",
          {
            class: "btn btn-ghost",
            type: "button",
            onclick: () => {
              about.highlights.push({ title: "New highlight", text: "", icon: "tools" });
              setDirty(true);
              render();
            },
          },
          ["+ Add highlight"],
        ),
      ]),
    ]),
  ];
}

function renderHeadings() {
  const groups = Object.keys(state.content.sections);
  const cards = groups.map((group) => {
    const section = state.content.sections[group];
    return card(group.charAt(0).toUpperCase() + group.slice(1), [
      field("Eyebrow", `sections.${group}.eyebrow`, section.eyebrow),
      field("Title", `sections.${group}.title`, section.title),
      field("Description", `sections.${group}.description`, section.description, {
        textarea: true,
      }),
    ]);
  });
  return cards;
}

function renderSkills() {
  return [
    listEditor("skills", {
      title: "Skill groups",
      itemLabel: (item, index) => item.category || `Group ${index + 1}`,
      makeItem: () => ({ category: "New category", icon: "backend", items: [] }),
      fields: (item, index, rerender) => [
        field("Category", `skills.${index}.category`, item.category),
        select("Icon", `skills.${index}.icon`, item.icon, SKILL_ICONS),
        tagList("Items", `skills.${index}.items`, item.items),
      ],
    }),
  ];
}

function renderExperience() {
  return [
    listEditor("experience", {
      title: "Race seats",
      itemLabel: (item, index) => item.company || `Stint ${index + 1}`,
      makeItem: () => ({
        role: "",
        company: "",
        season: "",
        period: "",
        stack: "",
        description: "",
        bullets: [],
        link: "",
        demo: "",
      }),
      fields: (item, index) => [
        field("Role", `experience.${index}.role`, item.role),
        field("Company", `experience.${index}.company`, item.company),
        h("div", { class: "card-body two", style: "padding:0;gap:12px;" }, [
          field("Season tag", `experience.${index}.season`, item.season, {
            placeholder: "SEASON 2026",
          }),
          field("Period", `experience.${index}.period`, item.period, {
            placeholder: "Jul – Aug 2026",
          }),
        ]),
        field("Stack", `experience.${index}.stack`, item.stack, {
          placeholder: "Node.js · Express · TypeScript · React",
        }),
        field("Description", `experience.${index}.description`, item.description, {
          textarea: true,
        }),
        bulletList("Bullets", `experience.${index}.bullets`, item.bullets),
        h("div", { class: "card-body two", style: "padding:0;gap:12px;" }, [
          field("Repository", `experience.${index}.link`, item.link, { type: "url" }),
          field("Demo", `experience.${index}.demo`, item.demo, { type: "url" }),
        ]),
      ],
    }),
  ];
}

function renderHackathons() {
  return [
    listEditor("hackathons", {
      title: "Hackathons",
      itemLabel: (item, index) => item.title || `Hackathon ${index + 1}`,
      makeItem: () => ({
        title: "New hackathon",
        project: "",
        award: "",
        position: null,
        date: "",
        description: "",
        tags: [],
        link: "",
      }),
      fields: (item, index) => [
        h("div", { class: "card-body two", style: "padding:0;gap:12px;" }, [
          field("Event", `hackathons.${index}.title`, item.title),
          field("Entry name", `hackathons.${index}.project`, item.project, {
            placeholder: "Ainek Mizenek",
          }),
        ]),
        h("div", { class: "card-body two", style: "padding:0;gap:12px;" }, [
          field("Award (display)", `hackathons.${index}.award`, item.award, {
            placeholder: "TOP 5 or P2",
          }),
          field("Exact position (optional)", `hackathons.${index}.position`, item.position, {
            type: "number",
            placeholder: "2",
            hint: "Drives gold/silver/bronze chip colours. 1–3 only.",
          }),
        ]),
        field("Date", `hackathons.${index}.date`, item.date, { placeholder: "Apr 2026" }),
        field("Description", `hackathons.${index}.description`, item.description, {
          textarea: true,
        }),
        tagList("Tags", `hackathons.${index}.tags`, item.tags),
        field("Repository link", `hackathons.${index}.link`, item.link, {
          type: "url",
        }),
      ],
    }),
  ];
}

function renderProjects() {
  return [
    listEditor("projects", {
      title: "Projects",
      itemLabel: (item, index) => item.title || `Project ${index + 1}`,
      makeItem: () => ({
        title: "New project",
        description: "",
        highlights: [],
        tech: [],
        repo: "",
        demo: "",
        featured: false,
      }),
      fields: (item, index) => [
        field("Title", `projects.${index}.title`, item.title),
        field("Description", `projects.${index}.description`, item.description, {
          textarea: true,
        }),
        bulletList("Highlights", `projects.${index}.highlights`, item.highlights),
        tagList("Tech", `projects.${index}.tech`, item.tech),
        field("Repository", `projects.${index}.repo`, item.repo, { type: "url" }),
        field("Demo", `projects.${index}.demo`, item.demo, { type: "url" }),
        h("label", { class: "field" }, [
          h("span", { text: "Works entry (featured)" }),
          (() => {
            const box = h("input", {
              type: "checkbox",
              "data-path": `projects.${index}.featured`,
              checked: Boolean(item.featured),
              style: "width:auto;",
            });
            bindValue(box, `projects.${index}.featured`);
            return box;
          })(),
        ]),
      ],
    }),
  ];
}

function renderEducation() {
  return [
    listEditor("education", {
      title: "Education",
      itemLabel: (item, index) => item.degree || `Entry ${index + 1}`,
      makeItem: () => ({ degree: "", school: "", period: "", description: "" }),
      fields: (item, index) => [
        field("Degree", `education.${index}.degree`, item.degree),
        field("School", `education.${index}.school`, item.school),
        field("Period", `education.${index}.period`, item.period),
        field("Description", `education.${index}.description`, item.description, {
          textarea: true,
        }),
      ],
    }),
    card("Licences", [
      tagList("Certifications", "certifications", state.content.certifications),
    ]),
    listEditor("languages", {
      title: "Languages",
      itemLabel: (item, index) => item.name || `Language ${index + 1}`,
      makeItem: () => ({ name: "", level: "" }),
      fields: (item, index) => [
        field("Name", `languages.${index}.name`, item.name),
        field("Level", `languages.${index}.level`, item.level, {
          placeholder: "Native / Intermediate / Fluent",
        }),
      ],
    }),
  ];
}

function renderSeo() {
  return [
    card("Search & social", [
      field("Title", "seo.title", state.content.seo.title),
      field("Description", "seo.description", state.content.seo.description, {
        textarea: true,
        hint: "Around 150-160 characters works best.",
      }),
    ]),
  ];
}

function renderMedia() {
  const grid = h("div", { class: "asset-grid" });

  state.assets.forEach((asset) => {
    const isImage = /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(asset.path);
    grid.append(
      h("div", { class: "asset" }, [
        h("div", { class: "asset-preview" }, [
          isImage
            ? h("img", { src: asset.path, alt: "" })
            : h("span", { class: "file", text: asset.path.split("/").pop() }),
        ]),
        h("div", { class: "asset-meta" }, [
          h("strong", { text: asset.path }),
          h("small", { text: `${(asset.size / 1024).toFixed(1)} KB` }),
          h("div", { class: "asset-actions" }, [
            h(
              "button",
              {
                type: "button",
                onclick: () => {
                  navigator.clipboard.writeText(asset.path);
                  toast("Path copied");
                },
              },
              ["Copy path"],
            ),
            h(
              "button",
              {
                type: "button",
                onclick: async () => {
                  if (!confirm(`Delete ${asset.path}?`)) return;
                  const response = await fetch(
                    `/api/assets${encodeURI(asset.path).replace(/#/g, "%23")}`,
                    { method: "DELETE" },
                  );
                  if (response.ok) {
                    toast("Asset deleted");
                    await refresh();
                  } else {
                    toast("Delete failed", "error");
                  }
                },
              },
              ["Delete"],
            ),
          ]),
        ]),
      ]),
    );
  });

  const dropzone = h("div", { class: "dropzone" }, [
    h("p", { text: "Drop images here, or" }),
    h(
      "button",
      {
        class: "btn btn-ghost",
        type: "button",
        onclick: () => {
          const input = h("input", { type: "file", accept: "image/*", multiple: true });
          input.click();
          input.addEventListener("change", async () => {
            for (const file of input.files) {
              const uploaded = await uploadFile(file);
              if (uploaded) toast(`Uploaded ${uploaded.path}`);
            }
            await refresh();
          });
        },
      },
      ["choose files"],
    ),
  ]);

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("drag");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag"));
  dropzone.addEventListener("drop", async (event) => {
    event.preventDefault();
    dropzone.classList.remove("drag");
    for (const file of event.dataTransfer.files) {
      const uploaded = await uploadFile(file);
      if (uploaded) toast(`Uploaded ${uploaded.path}`);
    }
    await refresh();
  });

  return [
    card("Upload", [dropzone]),
    h("div", { class: "card" }, [
      h("div", { class: "card-head" }, [h("h3", { text: "Library" })]),
      h("div", { class: "card-body" }, [
        state.assets.length ? grid : h("p", { class: "empty", text: "No assets yet." }),
      ]),
    ]),
  ];
}

function renderPublish() {
  const git = state.git || { changes: [], branch: "main", lastCommit: "" };
  const list = git.changes.length
    ? git.changes.map((change) =>
        h("div", {}, [h("span", { text: change.status }), h("span", { text: change.file })]),
      )
    : [h("div", {}, [h("span", { text: "clean" }), h("span", { text: "No uncommitted changes" })])];

  return [
    card("Repository", [
      h("div", { class: "field" }, [
        h("span", { text: "Branch" }),
        h("input", { value: git.branch, disabled: true }),
      ]),
      h("div", { class: "field" }, [
        h("span", { text: "Last commit" }),
        h("input", { value: git.lastCommit, disabled: true }),
      ]),
    ]),
    card("Pending changes", [h("div", { class: "publish-files" }, list)]),
    card("How publishing works", [
      h("p", {
        class: "subtitle",
        style: "line-height:1.7;margin:0;",
        text:
          "Publishing rebuilds the site locally, commits every change with your message, and pushes to GitHub. The deploy workflow then publishes the fresh build to GitHub Pages.",
      }),
    ]),
  ];
}

const RENDERERS = {
  profile: renderProfile,
  about: renderAbout,
  experience: renderExperience,
  headings: renderHeadings,
  skills: renderSkills,
  hackathons: renderHackathons,
  projects: renderProjects,
  education: renderEducation,
  seo: renderSeo,
  media: renderMedia,
  publish: renderPublish,
};

const SUBTITLES = {
  profile: "Your name, headline, status, contact details and links.",
  about: "The introduction shown in the Driver Briefing section.",
  experience: "Internships — the race seats on your record.",
  headings: "Titles and subtitles for each section of the page.",
  skills: "Group the technologies you want to showcase.",
  hackathons: "Championship rounds and the results you earned.",
  projects: "The work you want to show first.",
  education: "Your academic background, licences and languages.",
  seo: "How the site appears in search results and social cards.",
  media: "Upload and manage images and documents.",
  publish: "Review changes and send them live.",
};

function render() {
  el.editor.textContent = "";
  const nodes = RENDERERS[state.section]();
  for (const node of nodes) el.editor.append(node);

  const meta = SECTIONS.find((section) => section.id === state.section);
  el.title.textContent = meta.label;
  el.subtitle.textContent = SUBTITLES[state.section] || "";
}

function renderNav() {
  el.nav.textContent = "";
  SECTIONS.forEach((section) => {
    const count = section.count ? section.count(state.content) : null;
    el.nav.append(
      h(
        "button",
        {
          type: "button",
          class: section.id === state.section ? "active" : "",
          onclick: () => {
            state.section = section.id;
            renderNav();
            render();
          },
        },
        [section.label, count !== null ? h("span", { class: "count", text: count }) : null],
      ),
    );
  });
}

/* ------------------------------------------------------------------ */
/* actions                                                             */
/* ------------------------------------------------------------------ */

async function uploadFile(file) {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", "X-File-Name": file.name },
    body: file,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    toast(error.error || "Upload failed", "error");
    return null;
  }
  return response.json();
}

async function refresh() {
  const response = await fetch("/api/state");
  const data = await response.json();
  state.content = data.content;
  state.assets = data.assets;
  state.git = data.git;
  state.build = data.build;
  state.publish = data.publish;
  el.repoBranch.textContent = `${data.git.branch} · ${data.git.changes.length} change(s)`;
  renderNav();
  render();
  applyBuildState();
}

function applyBuildState() {
  const build = state.build;
  el.build.disabled = build.running;
  el.buildStatus.textContent = build.running
    ? "building…"
    : build.code === null
      ? "idle"
      : build.code === 0
        ? "build ok"
        : "build failed";
  el.buildStatus.style.color = build.running
    ? "#fcd34d"
    : build.code === 0
      ? "#6ee7b7"
      : build.code === null
        ? ""
        : "#fca5a5";
  el.buildLog.textContent = (build.log || []).slice(-40).join("\n");
}

async function save() {
  const response = await fetch("/api/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state.content, null, 2),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    toast(error.error || "Save failed", "error");
    return;
  }
  setDirty(false);
  toast("Content saved to content/portfolio.json");
  await refresh();
}

async function startBuild() {
  el.build.disabled = true;
  el.buildStatus.textContent = "building…";
  el.buildStatus.style.color = "#fcd34d";
  el.buildLog.textContent = "";

  const response = await fetch("/api/build", { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    toast(error.error || "Build failed to start", "error");
    return;
  }
  pollBuild();
}

async function pollBuild() {
  const response = await fetch("/api/state");
  const data = await response.json();
  state.build = data.build;
  applyBuildState();
  if (state.build.running) {
    setTimeout(pollBuild, 900);
    return;
  }
  if (state.build.code === 0) {
    toast("Build succeeded");
    el.preview.src = `/preview/?t=${Date.now()}`;
  } else {
    toast("Build failed - see the log", "error");
  }
}

function openPublishDialog() {
  const git = state.git || { changes: [] };
  el.publishBranch.textContent = git.branch || "main";
  el.publishFiles.textContent = "";
  if (!git.changes.length) {
    el.publishFiles.append(
      h("div", {}, [h("span", { text: "clean" }), h("span", { text: "No changes yet" })]),
    );
  } else {
    git.changes.forEach((change) =>
      el.publishFiles.append(
        h("div", {}, [h("span", { text: change.status }), h("span", { text: change.file })]),
      ),
    );
  }
  el.dialog.showModal();
}

async function runPublish() {
  el.publish.disabled = true;
  el.publish.textContent = "Publishing…";
  el.buildStatus.textContent = "publishing…";
  el.buildStatus.style.color = "#fcd34d";

  const response = await fetch("/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: el.publishMessage.value }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    toast(error.error || "Publish failed", "error");
    el.publish.disabled = false;
    el.publish.textContent = "Publish";
    return;
  }

  const poll = setInterval(async () => {
    const data = await (await fetch("/api/state")).json();
    state.build = data.build;
    state.git = data.git;
    applyBuildState();
    el.buildLog.textContent = (data.publish.log || []).slice(-40).join("\n");
    if (!data.publish.running) {
      clearInterval(poll);
      el.publish.disabled = false;
      el.publish.textContent = "Publish";
      if (data.publish.code === 0) {
        toast("Published - GitHub Actions is deploying the site");
        el.preview.src = `/preview/?t=${Date.now()}`;
      } else {
        toast("Publish failed - see the log", "error");
      }
      await refresh();
    }
  }, 1000);
}

/* ------------------------------------------------------------------ */
/* wiring                                                              */
/* ------------------------------------------------------------------ */

el.save.addEventListener("click", save);
el.build.addEventListener("click", startBuild);
el.publish.addEventListener("click", openPublishDialog);
el.refreshPreview.addEventListener("click", () => {
  el.preview.src = `/preview/?t=${Date.now()}`;
});

el.dialog.addEventListener("close", async () => {
  if (el.dialog.returnValue !== "confirm") return;
  await runPublish();
});

window.addEventListener("beforeunload", (event) => {
  if (!state.dirty) return;
  event.preventDefault();
  event.returnValue = "";
});

refresh().catch((error) => toast(error.message, "error"));
