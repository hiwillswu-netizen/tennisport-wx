const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Importing', venues.length, 'venues via MCP...\n');

let totalOk = 0;
let totalFail = 0;

// Process in batches of 5
const batchSize = 5;

for (let i = 0; i < venues.length; i += batchSize) {
  const batch = venues.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;
  
  // Build documents array - escape for command line
  const docsJson = JSON.stringify(batch);
  // Write to temp file to avoid command line escaping issues
  const tmpFile = path.join(__dirname, '_batch_docs.json');
  fs.writeFileSync(tmpFile, docsJson, 'utf8');
  
  try {
    // Read back and use as argument
    const docs = fs.readFileSync(tmpFile, 'utf8');
    
    // Use npx mcporter call with proper escaping
    const cmd = `npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents ${JSON.stringify(docs)}`;
    
    const result = execSync(cmd, { 
      encoding: 'utf-8', 
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    if (result.includes('"success": true') || result.includes('"insertedCount"')) {
      const match = result.match(/"insertedCount":\s*(\d+)/);
      const count = match ? parseInt(match[1]) : batch.length;
      totalOk += count;
      console.log(`[Batch ${batchNum}] OK: ${count} venues`);
      batch.forEach(v => console.log(`  - ${v.name}`));
    } else {
      totalFail += batch.length;
      console.log(`[Batch ${batchNum}] FAIL`);
      console.log(result.substring(0, 500));
    }
  } catch (e) {
    totalFail += batch.length;
    console.log(`[Batch ${batchNum}] ERR:`, e.message.substring(0, 200));
  }
  
  // Cleanup
  try { fs.unlinkSync(tmpFile); } catch (e) {}
}

console.log('\n=== Import Complete ===');
console.log('Success:', totalOk);
console.log('Failed:', totalFail);
