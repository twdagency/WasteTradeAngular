import { injectable } from '@loopback/context/dist/binding-decorator';
import { BindingScope } from '@loopback/core';
import { Readable } from 'stream';
import axios, { AxiosResponse } from 'axios';
import csv from 'csv-parser';
import fs from 'fs';
import { WP_EXPORT_URLS } from '../../config';
import { IDataResponse } from '../../types';
import path from 'path';

export interface CsvRow {
    [key: string]: string;
}

@injectable({ scope: BindingScope.TRANSIENT })
export class WpExternalService {
    async csvToJson(csvData: string): Promise<CsvRow[]> {
        return new Promise((resolve, reject) => {
            const results: CsvRow[] = [];

            // Create a readable stream from the CSV data
            const stream = Readable.from([csvData]);

            stream
                .pipe(csv())
                .on('data', (data: CsvRow) => {
                    results.push(data);
                })
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error: Error) => {
                    reject(error);
                });
        });
    }

    async fetchCsvData(url: string): Promise<string> {
        try {
            const response: AxiosResponse<string> = await axios.get(url, {
                headers: {
                    Accept: 'text/csv,application/csv,text/plain,*/*',
                },
                timeout: 60000, // 60 seconds timeout
                responseType: 'text',
            });

            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching CSV data:', errorMessage);
            throw error;
        }
    }

    saveJsonToFile(jsonData: CsvRow[], filename: string): void {
        try {
            const jsonString = JSON.stringify(jsonData, null, 2);
            fs.writeFileSync(filename, jsonString, 'utf8');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error saving JSON file:', errorMessage);
            throw error;
        }
    }

    async syncDataFromWP(): Promise<IDataResponse<null>> {
        if (WP_EXPORT_URLS.length === 0) {
            return {
                status: 'error',
                message: 'No export URLs configured in WP_EXPORT_URLS',
                data: null,
            };
        }

        try {
            await Promise.all(
                WP_EXPORT_URLS.map(async (exportUrlTable) => {
                    const csvUrl = exportUrlTable.exportUrl;

                    // Output filename
                    const outputFilename = path.join(
                        `${process.cwd()}/src/services/wp-external/data`,
                        `${exportUrlTable.tableName}.json`,
                    );

                    // Step 1: Fetch CSV data from URL
                    const csvData = await this.fetchCsvData(csvUrl);

                    // Step 2: Convert CSV to JSON
                    const jsonData = await this.csvToJson(csvData);

                    // Step 3: Save JSON to file
                    this.saveJsonToFile(jsonData, outputFilename);
                }),
            );

            return {
                status: 'success',
                message: 'Data synchronization completed successfully',
                data: null,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('\n=== Error ===');
            console.error('Failed to process CSV data:', errorMessage);

            return {
                status: 'error',
                message: errorMessage,
                data: null,
            };
        }
    }

    async getDataFromFile(filename: string): Promise<IDataResponse<unknown>> {
        try {
            const filePath = path.join(`${process.cwd()}/src/services/wp-external/data`, filename);
            const fileContent = fs.readFileSync(filePath, 'utf8');

            return {
                status: 'success',
                message: 'File read successfully',
                data: JSON.parse(fileContent),
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error reading file:', errorMessage);
            return {
                status: 'error',
                message: errorMessage,
                data: null,
            };
        }
    }
}
