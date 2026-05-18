const fs = require('fs');
const path = require('path');

// Load venues
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));
const ENV = 'willswu-d1gttwhxle25af194';

// Generate batch script
let script = '@echo off\nchcp 65001 >nul\n';
script += 'echo Importing ' + venues.length + ' venues...\n\n';

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
  
  // Escape for Windows batch (double the quotes, escape with ^)
  let cmdJson = JSON.stringify(mgoCmd);
  // Replace " with \" for command line
  cmdJson = cmdJson.replace(/"/g, '\\"');
  
  script += `echo [${i + 1}/${venues.length}] ${v.name.substring(0, 10)}...\n`;
  script += `tcb db nosql execute -e ${ENV} --command "${cmdJson}" --json >nul 2>&1\n`;
  script += `if errorlevel 1 (echo FAIL) else (echo OK)\n\n`;
}

script += 'echo.\necho Import complete!\npause\n';

fs.writeFileSync(path.join(__dirname, 'import-venues.bat'), script, 'utf8');
console.log('Generated import-venues.bat');
console.log('Run it with: scripts\\import-venues.bat');
