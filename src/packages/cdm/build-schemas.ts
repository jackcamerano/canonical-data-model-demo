/* eslint-disable security/detect-non-literal-fs-filename -- build script, all paths derived from import.meta.dirname */
import fs from 'node:fs/promises'
import path from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { compile } from 'json-schema-to-typescript'
import YAML from 'yaml'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const __dirname = import.meta.dirname
const schemasDir = path.join(__dirname, 'schemas')
const generatedDir = path.join(__dirname, 'generated')

await fs.mkdir(generatedDir, { recursive: true })

const allFiles = await fs.readdir(schemasDir)
const yamlFiles = allFiles.filter(f => f.endsWith('.schema.yaml'))

async function processSchema(file: string): Promise<void> {
  const yamlContent = await fs.readFile(path.join(schemasDir, file), 'utf-8')
  const schema = YAML.parse(yamlContent)

  const schemaValid = ajv.validateSchema(schema)
  if (!schemaValid) {
    const errors = ajv.errors
      ?.map(e => `${e.instancePath}: ${e.message}`)
      .join('\n')
    throw new Error(`Invalid JSON Schema in ${file}:\n${errors}`)
  }

  const baseName = file.replace('.schema.yaml', '')

  const jsonFile = `${baseName}.schema.json`
  await fs.writeFile(
    path.join(generatedDir, jsonFile),
    JSON.stringify(schema, null, 2) + '\n'
  )
  console.log(`[build-schemas] ${file} -> generated/${jsonFile}`)

  const tsFile = `${baseName}.types.ts`
  const tsSource = await compile(schema, schema.title ?? baseName, {
    bannerComment:
      '/* Auto-generated from ' + file + ' -- do not edit manually */'
  })
  await fs.writeFile(path.join(generatedDir, tsFile), tsSource)
  console.log(`[build-schemas] ${file} -> generated/${tsFile}`)
}

try {
  await Promise.all(yamlFiles.map(processSchema))
  console.log('[build-schemas] Done.')
} catch (err) {
  console.error('[build-schemas]', err instanceof Error ? err.message : err)
  process.exit(1)
}
