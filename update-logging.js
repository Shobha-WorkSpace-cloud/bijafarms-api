const fs = require('fs');
const path = require('path');

// Route files to update
const routeFiles = [
  'src/routes/expenses.ts',
  'src/routes/tasks.ts', 
  'src/routes/animals.ts',
  'src/routes/sms-reminders.ts',
  'src/routes/test-reminder.ts'
];

const updateFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add logger import if not present
    if (!content.includes("import logger from '../utils/errorLogger'")) {
      const importSection = content.match(/(import.*?;\n)+/s);
      if (importSection) {
        const lastImport = importSection[0];
        content = content.replace(lastImport, lastImport + "import logger from '../utils/errorLogger';\n");
      }
    }
    
    // Replace common console.error patterns
    content = content.replace(
      /console\.error\("([^"]+)"(?:,\s*([^)]+))?\);/g,
      'await logger.error("$1", "' + path.basename(filePath, '.ts') + '", $2);'
    );
    
    // Replace console.log patterns
    content = content.replace(
      /console\.log\("([^"]+)"(?:,\s*([^)]+))?\);/g,
      'await logger.info("$1", "' + path.basename(filePath, '.ts') + '", $2);'
    );
    
    // Replace console.warn patterns
    content = content.replace(
      /console\.warn\("([^"]+)"(?:,\s*([^)]+))?\);/g,
      'await logger.warn("$1", "' + path.basename(filePath, '.ts') + '", $2);'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated logging in ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
};

// Update all route files
routeFiles.forEach(updateFile);

console.log('Logging update complete!');
