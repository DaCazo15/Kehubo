import fs from 'fs'
import path from 'path'

const htmlPath = path.resolve('docs/architecture.html')
const svgOutputPath = path.resolve('docs/architecture.svg')

const html = fs.readFileSync(htmlPath, 'utf8')

// Extract SVG
const svgMatch = html.match(/<svg[\s\S]*?<\/svg>/i)
if (!svgMatch) {
  console.error('❌ No se encontró la etiqueta <svg> en docs/architecture.html')
  process.exit(1)
}

let svg = svgMatch[0]

// Extract CSS style blocks from the HTML to embed directly into the standalone SVG
const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
const combinedCss = styleMatches.map(m => m[1]).join('\n')

// Ensure xmlns and proper namespaces are present
if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
  svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"')
}

// Inject styles inside <defs><style> if not already inside <svg>
if (!svg.includes('<style')) {
  const styleTag = `<defs><style type="text/css"><![CDATA[\n${combinedCss}\n]]></style></defs>`
  svg = svg.replace(/(<svg[^>]*>)/i, `$1\n${styleTag}`)
}

fs.writeFileSync(svgOutputPath, svg, 'utf8')
console.log(`✅ SVG exportado con éxito a ${svgOutputPath} (${(svg.length / 1024).toFixed(1)} KB)`)
