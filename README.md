# Resume

[![json resume badge](https://img.shields.io/badge/format-json_resume-fff18f?style=for-the-badge)](https://jsonresume.org)

My resume

- [resume.json](./resume.json)
- [resume.md](./resume.md)
- [resume.html](https://platane.github.io/resume/)


# Usage

```sh

# generate md file
bun --print "require('./src/generateMarkdown.ts').generateMarkdown()" > resume.md

# generate html file
bun --print "require('./src/generateHtml.tsx').generateHtml()" > dist/resume.html

bunx nodemon --exec 'bun --print "require(\"./src/generateHtml.tsx\").generateHtml()" > dist/resume.html' -e tx,tsx,css,json

# generate pdf file
bun --eval "require('./src/generatePdf.ts').generatePdf({outFile:'dist/resume.pdf'})"

bunx nodemon --exec 'bun --eval "require(\"./src/generatePdf.ts\").generatePdf({outFile:\"dist/resume.pdf\"})"' -e tx,tsx,css,json
```
