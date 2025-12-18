import * as XLSX from "xlsx";

/**
 * Downloads an Excel workbook with a specified filename.
 * Uses the native XLSX.writeFile method for maximum compatibility.
 */
export const downloadExcel = (workbook: XLSX.WorkBook, filename: string) => {
    try {
        console.log(`Starting Excel download: ${filename}`);

        // Use XLSX.writeFile directly - this is the most reliable method
        XLSX.writeFile(workbook, filename, { bookType: "xlsx" });

        console.log(`Download initiated for: ${filename}`);
    } catch (error) {
        console.error("Critical error during Excel download:", error);
    }
};
