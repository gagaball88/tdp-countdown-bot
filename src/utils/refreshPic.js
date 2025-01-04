import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';
const { Client } = pg;
import { pgConfig } from "../config/credentials.js";

const outputDir = './temp';

async function extractImage(categories) {
    const client = new Client(pgConfig);
  
    try {
      await client.connect();
  
      // Convert categories to a string if it's an array
      const categoryArray = Array.isArray(categories) ? categories : categories.split(',');
      const uniqueCategories = Array.from(new Set(categoryArray.map(c => c.trim()))); // Remove duplicates and trim whitespace
  
      // Step 1: Get the total number of rows for the specified categories
      const countQuery = `SELECT COUNT(*) FROM pictures WHERE category IN (${uniqueCategories.map((_, i) => `$${i + 1}`).join(',')})`;
      const countResult = await client.query(countQuery, uniqueCategories);
      const totalCount = parseInt(countResult.rows[0].count, 10);
  
      if (totalCount === 0) {
        throw new Error(`No pictures found in the specified categories: ${uniqueCategories.join(', ')}`);
      }
  
      // Step 2: Generate a random index based on the total count
      const randomIndex = Math.floor(Math.random() * totalCount);
      console.log("Total count: " + totalCount + ", Index: " + randomIndex);
  
      // Step 3: Fetch the random picture based on the random index
      const pictureQuery = `
        SELECT id, picture_data FROM pictures 
        WHERE category IN (${uniqueCategories.map((_, i) => `$${i + 1}`).join(',')}) 
        ORDER BY id OFFSET $${uniqueCategories.length + 1} LIMIT 1`;
  
      const pictureResult = await client.query(pictureQuery, [...uniqueCategories, randomIndex]);
  
      if (pictureResult.rows.length === 0) {
        throw new Error(`Picture not found for the specified categories at index ${randomIndex}.`);
      }
  
      const picture = pictureResult.rows[0];
  
      // Step 4: Ensure the output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
  
      // Step 5: Save the picture as a file
      const filePath = path.join(outputDir, `temp_img.jpg`);
      fs.writeFileSync(filePath, picture.picture_data);
  
      console.log(`Image with ID ${picture.id} saved to ${filePath}`);
    } catch (error) {
      console.error('Failed to extract the image:', error);
    } finally {
      await client.end();
    }
  }

export default function refreshPic(categories) {
    //predefined slots: slot 1 - S1E1
    extractImage(categories);
    return `./temp/temp_img.jpg`
}