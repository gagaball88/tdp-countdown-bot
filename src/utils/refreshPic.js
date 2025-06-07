import fs from 'fs'
import path from 'path'
import pg from 'pg';
import logger from './logger.js';
const { Client } = pg;
import { pgConfig } from "../config/credentials.js";

const outputDir = './pictures';
const tempImageName = 'temp_img.jpg'; // Define image name for consistency

async function extractImage(categories) {
  const client = new Client(pgConfig);
  const filePath = path.join(outputDir, tempImageName); // Define filePath early

  try {
    // Ensure the output directory exists before any file operations
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logger('INFO', `Created directory: ${outputDir}`);

      // Also ensure the 'endings' subdirectory is created
      const endingsDirPath = path.join(outputDir, 'endings');
      if (!fs.existsSync(endingsDirPath)) {
        fs.mkdirSync(endingsDirPath, { recursive: true });
        logger('INFO', `Created directory: ${endingsDirPath}`);
      }
    }

    await client.connect();

    //Convert categories to a string if it's an array
    const categoryArray = Array.isArray(categories) ? categories : categories.split(',');
    const uniqueCategories = Array.from(new Set(categoryArray.map(c => c.trim()))); //Remove duplicates and trim whitespace

    //Get the total number of rows for the specified categories
    const countQuery = `SELECT COUNT(*) FROM pictures WHERE category IN (${uniqueCategories.map((_, i) => `$${i + 1}`).join(',')})`;
    const countResult = await client.query(countQuery, uniqueCategories);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    if (totalCount === 0) {
      throw new Error(`No pictures found in the specified categories: ${uniqueCategories.join(', ')}`);
    }

    //Generate a random index based on the total count
    const randomIndex = Math.floor(Math.random() * totalCount);

    //Fetch the random picture based on the random index
    const pictureQuery = `
        SELECT id, picture_data FROM pictures 
        WHERE category IN (${uniqueCategories.map((_, i) => `$${i + 1}`).join(',')}) 
        ORDER BY id OFFSET $${uniqueCategories.length + 1} LIMIT 1`;

    const pictureResult = await client.query(pictureQuery, [...uniqueCategories, randomIndex]);

    if (pictureResult.rows.length === 0) {
      throw new Error(`Picture not found for the specified categories at index ${randomIndex}.`);
    }

    const picture = pictureResult.rows[0];

    //Save the picture as a file
    fs.writeFileSync(filePath, picture.picture_data);

    logger('INFO', `Image with ID ${picture.id} saved to ${filePath}`);
  } catch (error) {
    logger('ERROR', `Failed to extract the image: ${String(error)}`);
    // Attempt to delete temp_img.jpg if it exists, as it might be corrupted or from a failed previous attempt
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger('WARN', `Attempted to delete potentially corrupted ${filePath} after error.`);
      }
    } catch (deleteError) {
      logger('ERROR', `Error deleting ${filePath} after an extraction error: ${String(deleteError)}`);
    }
    throw error; // Re-throw the original error
  } finally {
    await client.end();
  }
}

export default async function refreshPic(categories) {
  await extractImage(categories);
  return path.join(outputDir, tempImageName); // Use defined constant
}