import React, { useState } from 'react';
import { FaFileUpload, FaFileDownload, FaInfoCircle } from 'react-icons/fa';

interface CSVImportExportProps {
  onImport: (data: any[]) => void;
  onExport: () => any[];
  type: 'daekstoerrelse' | 'daekbrand';
}

// Hjælpefunktion til at parse CSV
const parseCSV = (csvText: string): any[] => {
  // Split CSV text i linjer og fjern tomme linjer
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Den første linje indeholder kolonnenavnene
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Opbyg resultatet ved at gå igennem alle datalinjer
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    if (values.length !== headers.length) continue; // Spring linjer over med forkert antal kolonner
    
    const row: {[key: string]: string | number | boolean} = {};
    for (let j = 0; j < headers.length; j++) {
      // Konverter værdier til korrekte datatyper (nummer, boolean)
      let value: string | number | boolean = values[j];
      
      // For boolean værdier (true/false)
      if (value.toLowerCase() === 'true') value = true;
      else if (value.toLowerCase() === 'false') value = false;
      // For numeriske værdier
      else if (!isNaN(Number(value))) value = Number(value);
      
      row[headers[j]] = value;
    }
    data.push(row);
  }
  
  return data;
};

// Hjælpefunktion til at genere CSV fra data
const generateCSV = (data: any[], customHeaders?: string[]): string => {
  if (data.length === 0) return '';

  // Brug customHeaders hvis givet, ellers udled fra første datarække
  const headers = customHeaders || Object.keys(data[0]);
  let csv = headers.join(',') + '\n';

  // Tilføj hver række til CSV
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Formatér værdi korrekt (omslut tekst med anførselstegn hvis den indeholder komma)
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    csv += values.join(',') + '\n';
  });

  return csv;
};

// Funktion til at downloade en tekstfil
const downloadFile = (content: string, fileName: string, contentType: string): void => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const CSVImportExport: React.FC<CSVImportExportProps> = ({ onImport, onExport, type }) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Håndter fil-upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const parsedData = parseCSV(csvData);
        
        if (parsedData.length === 0) {
          setImportError('Ingen gyldige data fundet i CSV filen.');
          return;
        }
        
        // Validér data baseret på type
        if (type === 'daekstoerrelse') {
          // Tjek nødvendige kolonner for dækstørrelser
          const requiredColumns = ['bredde', 'profil', 'diameter'];
          const missingColumns = requiredColumns.filter(col => 
            !Object.keys(parsedData[0]).includes(col)
          );
          
          if (missingColumns.length > 0) {
            setImportError(`Manglende påkrævede kolonner: ${missingColumns.join(', ')}`);
            return;
          }
        } else if (type === 'daekbrand') {
          // Tjek nødvendige kolonner for dækbrands
          const requiredColumns = ['navn', 'kategori'];
          const missingColumns = requiredColumns.filter(col => 
            !Object.keys(parsedData[0]).includes(col)
          );
          
          if (missingColumns.length > 0) {
            setImportError(`Manglende påkrævede kolonner: ${missingColumns.join(', ')}`);
            return;
          }
        }

        // Kald onImport callback med de parsede data
        onImport(parsedData);
        setImportSuccess(`${parsedData.length} rækker er blevet importeret.`);
        e.target.value = ''; // Nulstil input-feltet
      } catch (error) {
        setImportError('Fejl ved import af CSV: ' + (error as Error).message);
        console.error('CSV import error:', error);
      }
    };

    reader.onerror = () => {
      setImportError('Der opstod en fejl ved læsning af filen.');
    };

    reader.readAsText(file);
  };

  // Håndter data-eksport
  const handleExport = () => {
    try {
      const data = onExport();
      if (!data || data.length === 0) {
        setImportError('Ingen data at eksportere.');
        return;
      }

      let csvContent = '';
      let fileName = '';

      if (type === 'daekstoerrelse') {
        // Specialiseret format for dækstørrelser med priser
        fileName = 'daek-stoerrelse-priser.csv';
        csvContent = generateCSV(data);
      } else if (type === 'daekbrand') {
        // Format for dækbrands
        fileName = 'daek-brands.csv';
        csvContent = generateCSV(data);
      }

      downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
      setImportSuccess('Data er blevet eksporteret til CSV.');
    } catch (error) {
      setImportError('Fejl ved eksport af CSV: ' + (error as Error).message);
      console.error('CSV export error:', error);
    }
  };

  // Hjælpetekst baseret på type
  const getHelpText = () => {
    if (type === 'daekstoerrelse') {
      return (
        <div>
          <h4 className="font-medium">CSV format for dækstørrelser:</h4>
          <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
            bredde,profil,diameter,budget_sommer,economy_sommer,premium_sommer,budget_vinter,economy_vinter,premium_vinter,budget_helaar,economy_helaar,premium_helaar<br/>
            195,65,15,450,650,950,500,700,1000,550,750,1050<br/>
            205,55,16,550,750,1050,600,800,1100,650,850,1150
          </pre>
        </div>
      );
    } else {
      return (
        <div>
          <h4 className="font-medium">CSV format for dækbrands:</h4>
          <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
            navn,kategori,sommer,vinter,helaar<br/>
            Michelin,premium,true,true,true<br/>
            Continental,premium,true,true,false<br/>
            Pirelli,economy,true,false,false
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-700 mb-2">CSV Import/Export</h3>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
            <FaFileUpload className="mr-2" />
            Importer CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>
        
        <div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <FaFileDownload className="mr-2" />
            Eksporter CSV
          </button>
        </div>
        
        <div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaInfoCircle className="mr-2" />
            {showHelp ? 'Skjul hjælp' : 'Vis CSV format'}
          </button>
        </div>
      </div>
      
      {importError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mt-2">
          {importError}
        </div>
      )}
      
      {importSuccess && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded mt-2">
          {importSuccess}
        </div>
      )}
      
      {showHelp && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded">
          {getHelpText()}
        </div>
      )}
    </div>
  );
};

export default CSVImportExport;
