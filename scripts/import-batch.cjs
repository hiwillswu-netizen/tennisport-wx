const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Importing', venues.length, 'venues...');

// Batch insert - 10 at a time
const batchSize = 10;
let totalOk = 0;
let totalFail = 0;

for (let i = 0; i < venues.length; i += batchSize) {
  const batch = venues.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;
  
  // Create MongoDB insert command
  const insertCmd = {
    insert: 'venues',
    documents: batch
  };
  
  // Create the command array format required by tcb
  const mgoCmd = [{
    TableName: 'venues',
    CommandType: 'INSERT',
    Command: JSON.stringify(insertCmd)
  }];
  
  // Write to temp file
  const tmpFile = path.join(__dirname, `_batch_${batchNum}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(mgoCmd), 'utf8');
  
  try {
    // Use --commandFile instead of inline --command to avoid escaping issues
    const cmd = `tcb db nosql execute -e ${ENV} --commandFile "${tmpFile}" --json`;
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 120000 });
    
    if (result.includes('"n"')) {
      // Extract the count from the result
      const match = result.match(/"n":\s*\{\s*"\$numberInt":\s*"(\d+)"/);
      const count = match ? parseInt(match[1]) : batch.length;
      totalOk += count;
      console.log(`[Batch ${batchNum}] OK: ${count} venues (${batch.map(v => v.name.substring(0, 6)).join(', ')}...)`);
    } else {
      totalFail += batch.length;
      console.log(`[Batch ${batchNum}] FAIL:`, batch.map(v => v.name).join(', '));
    }
  } catch (e) {
    totalFail += batch.length;
    console.log(`[Batch ${batchNum}] ERR:`, e.message.substring(0, 100));
  }
  
  // Cleanup temp file
  try { fs.unlinkSync(tmpFile); } catch (e) {}
}

console.log('\n=== Import Complete ===');
console.log('Success:', totalOk);
console.log('Failed:', totalFail);
