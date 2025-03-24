
export function cleanResponse(response: string): string {
  if (!response) {
    return "I couldn't generate a response. Please try asking your question again.";
  }
  
  // Remove any source citations like 【8:0†source】
  const cleanedResponse = response.replace(/【[^】]*】/g, '');
  
  // Handle and preserve table formatting
  let formattedResponse = preserveTables(cleanedResponse);
  
  // Format contract references with the standardized format - ensure they stand out
  formattedResponse = formattedResponse.replace(
    /\[REF\](.*?)\[\/REF\]/g,
    (match, reference) => {
      // Add the colored diamond emoji and format in a highlighted box
      return `\n\n🔹 Reference: ${reference.trim()}\n`;
    }
  );
  
  // If no references were found and it's not an error message about non-contract content
  if (!formattedResponse.includes('🔹 Reference:') && 
      !formattedResponse.includes("I'm designed to answer questions about your union contract")) {
    formattedResponse = formattedResponse + '\n\n🔹 Note: No specific contract references were found for this query. Please consult your union representative for further clarification.';
  }
  
  return formattedResponse;
}

// Function to detect and preserve tabular data
function preserveTables(text: string): string {
  // Check if the response appears to contain tabular data
  if (containsTabularData(text)) {
    // Look for patterns that suggest a table - rows of data with consistent delimiters
    const lines = text.split('\n');
    let tableStart = -1;
    let tableEnd = -1;
    let isTableDetected = false;
    
    // Detect table boundaries
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect table headers (e.g., "| Column 1 | Column 2 |" or "Column 1 | Column 2")
      if (
        (line.includes('|') && line.split('|').length > 2) || 
        (line.match(/\w+\s*\|\s*\w+/))
      ) {
        if (!isTableDetected) {
          tableStart = i;
          isTableDetected = true;
        }
        tableEnd = i;
      } else if (isTableDetected && line === '') {
        // End of table detected
        break;
      }
    }
    
    // If we found a table, convert it to HTML
    if (isTableDetected && tableStart >= 0 && tableEnd >= tableStart) {
      const tableLines = lines.slice(tableStart, tableEnd + 1);
      const htmlTable = convertToHtmlTable(tableLines);
      
      // Replace the table text with HTML table
      const textBefore = lines.slice(0, tableStart).join('\n');
      const textAfter = lines.slice(tableEnd + 1).join('\n');
      
      return textBefore + '\n' + htmlTable + '\n' + textAfter;
    }
  }
  
  return text;
}

// Check if text likely contains tabular data
function containsTabularData(text: string): boolean {
  // Check for typical table indicators
  const hasVerticalBars = text.includes('|');
  const hasConsistentStructure = text.split('\n')
    .filter(line => line.trim().length > 0)
    .some(line => {
      const parts = line.split('|');
      return parts.length > 2;
    });
    
  // Check for keywords that suggest tabular data
  const tableKeywords = [
    'table', 'pay scale', 'rates', 'schedule', 
    'hourly rate', 'monthly', 'yearly', 'salary',
    'years of service', 'per diem'
  ];
  
  const hasTableKeywords = tableKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  return (hasVerticalBars && hasConsistentStructure) || hasTableKeywords;
}

// Convert text table to HTML table
function convertToHtmlTable(tableLines: string[]): string {
  // Clean up the lines and identify table structure
  const cleanLines = tableLines.map(line => 
    line.trim().replace(/^\||\|$/g, '').trim()
  );
  
  // First line is assumed to be header
  const headerLine = cleanLines[0];
  const headers = headerLine.split('|').map(h => h.trim());
  
  // Start building HTML table
  let htmlTable = '<table>\n';
  
  // Add header row
  htmlTable += '  <tr>\n';
  headers.forEach(header => {
    htmlTable += `    <th>${header}</th>\n`;
  });
  htmlTable += '  </tr>\n';
  
  // Add data rows (skip the header)
  for (let i = 1; i < cleanLines.length; i++) {
    // Skip separator lines (like +---------+)
    if (cleanLines[i].match(/^[+\-|=\s]+$/)) continue;
    
    const cells = cleanLines[i].split('|').map(c => c.trim());
    
    htmlTable += '  <tr>\n';
    cells.forEach(cell => {
      htmlTable += `    <td>${cell}</td>\n`;
    });
    htmlTable += '  </tr>\n';
  }
  
  htmlTable += '</table>';
  return htmlTable;
}

export function containsNonContractContent(content: string): boolean {
  if (!content) return false;
  
  // More specifically target non-contract topics
  const nonContractKeywords = [
    'weather forecast',
    'stock market',
    'sports game',
    'movie review',
    'restaurant recommendation',
    'food recipe',
    'video game',
    'vacation planning',
    'hotel booking',
    'flight booking'
  ];

  // Aviation and union contract related terms that should NOT trigger the filter
  const contractRelatedTerms = [
    'flight', 'pay', 'rest', 'layover', 'schedule', 'assignment',
    'duty', 'reserve', 'sick leave', 'vacation', 'holiday',
    'cancel', 'delay', 'overtime', 'per diem', 'pilot', 'crew',
    'aircraft', 'training', 'benefits', 'pay rate', 'contract',
    'union', 'seniority', 'base', 'bid', 'international', 'domestic',
    'hours', 'compensation', 'meal', 'hotel', 'accomodation',
    'deadhead', 'minimum guarantee', 'reroute', 'time off',
    'grievance', 'furlough', 'leaves', 'rights', 'insurance'
  ];

  // Check for exact matches of non-contract keywords
  const contentLower = ' ' + content.toLowerCase() + ' '; // Add spaces to ensure we match whole words
  
  // Check if the content contains any non-contract keywords
  const containsNonContract = nonContractKeywords.some(keyword => {
    // Check for whole word or phrase match
    return contentLower.includes(' ' + keyword.toLowerCase() + ' ');
  });
  
  // If the content contains a contract-related term, allow it even if it might have matched a non-contract keyword
  const containsContractTerm = contractRelatedTerms.some(term => {
    return contentLower.includes(term.toLowerCase());
  });
  
  // Return true only if there's a non-contract keyword AND no contract-related terms
  return containsNonContract && !containsContractTerm;
}
