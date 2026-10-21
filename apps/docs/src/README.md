# apps/docs/src

The Mintlify root. `docs.json` is the site; every other file is a page it lists under `navigation`,
or a file a page references. Add a page: write the `.mdx`, add its path to a group in `docs.json`. A
page not in `docs.json` is not served and `mint validate` warns.

| Folder           | Written by | Tab in `docs.json`      |
| ---------------- | ---------- | ----------------------- |
| `guides/`        | hand       | Guides                  |
| `adr/`           | hand       | Architecture            |
| `api-reference/` | gen        | API reference           |
| `llms.txt`       | gen        | (served at `/llms.txt`) |
