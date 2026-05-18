const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Importing', venues.length, 'venues one by one...');

let totalOk = 0;
let totalFail = 0;

for (let i = 0; i < venues.length; i++) {
  const v = venues[i];
  
  // Create MongoDB insert command for single venue
  const insertCmd = {
    insert: 'venues',
    documents: [v]
  };
  
  const mgoCmd = [{
    TableName: 'venues',
    CommandType: 'INSERT',
    Command: JSON.stringify(insertCmd)
  }];
  
  // Convert to JSON string
  const cmdJson = JSON.stringify(mgoCmd);
  
  try {
    // Use spawnSync with proper argument handling
    const result = spawnSync('tcb', [
      'db', 'nosql', 'execute',
      '-e', ENV,
      '--command', cmdJson,
      '--json'
    ], {
      encoding: 'utf-8',
      timeout: 60000,
      shell: true
    });
    
    const output = result.stdout + result.stderr;
    
    if (output.includes('"n"') && output.includes('"ok"')) {
      totalOk++;
      console.log(`[${i + 1}/${venues.length}] OK: ${v.name}`);
    } else {
      totalFail++;
      console.log(`[${i + 1}/${venues.length}] FAIL: ${v.name}`);
      if (result.stderr) console.log('  Error:', result.stderr.substring(0, 200));
    }
  } catch (e) {
    totalFail++;
    console.log(`[${i + 1}/${venues.length}] ERR: ${v.name} - ${e.message.substring(0, 100)}`);
  }
}

console.log('\n=== Import Complete ===');
console.log('Success:', totalOk);
console.log('Failed:', totalFail);
