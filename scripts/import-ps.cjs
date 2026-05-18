const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Importing', venues.length, 'venues...');

let totalOk = 0;
let totalFail = 0;

// Process one venue at a time
for (let i = 0; i < venues.length; i++) {
  const v = venues[i];
  
  // Create the insert command
  const insertDoc = {
    insert: 'venues',
    documents: [v]
  };
  
  const mgoCmd = [{
    TableName: 'venues',
    CommandType: 'INSERT',
    Command: JSON.stringify(insertDoc)
  }];
  
  // Write to temp file
  const tmpFile = path.join(__dirname, '_tmp_insert.json');
  fs.writeFileSync(tmpFile, JSON.stringify(mgoCmd), 'utf8');
  
  // Read file content and escape for PowerShell
  const cmdContent = fs.readFileSync(tmpFile, 'utf8');
  const escaped = cmdContent.replace(/'/g, "''");
  
  try {
    // Use PowerShell to avoid CMD escaping issues
    const psCmd = `powershell -Command "tcb db nosql execute -e ${ENV} --command '${escaped}' --json"`;
    const result = execSync(psCmd, { 
      encoding: 'utf-8', 
      timeout: 60000,
      windowsHide: true
    });
    
    if (result.includes('"n"') && result.includes('"ok"')) {
      totalOk++;
      console.log(`[${i + 1}/${venues.length}] OK: ${v.name}`);
    } else {
      totalFail++;
      console.log(`[${i + 1}/${venues.length}] FAIL: ${v.name}`);
    }
  } catch (e) {
    totalFail++;
    console.log(`[${i + 1}/${venues.length}] ERR: ${v.name}`);
  }
  
  // Cleanup temp file
  try { fs.unlinkSync(tmpFile); } catch (e) {}
}

console.log('\n=== Import Complete ===');
console.log('Success:', totalOk);
console.log('Failed:', totalFail);
