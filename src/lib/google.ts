import { google } from 'googleapis';
import { Readable } from 'stream';

// Google API configuration
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
];

function normalizePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;

  const trimmed = raw.trim();
  const unwrapped =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  return unwrapped.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
}

// Initialize Google Auth
async function getGoogleAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
    },
    scopes: SCOPES,
  });
  
  return auth;
}

// Google Drive instance
export async function getDriveClient() {
  const auth = await getGoogleAuth();
  return google.drive({ version: 'v3', auth });
}

// Google Sheets instance
export async function getSheetsClient() {
  const auth = await getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}

// Product type definition
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'men' | 'women' | 'children';
  imageUrl: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  createdAt: string;
}

// Sheet headers
const SHEET_HEADERS = [
  'id',
  'name',
  'description',
  'price',
  'category',
  'imageUrl',
  'sizes',
  'colors',
  'featured',
  'createdAt',
];

// Get all products from Google Sheets
export async function getProducts(): Promise<Product[]> {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  
  if (!spreadsheetId) {
    console.error('GOOGLE_SPREADSHEET_ID not set');
    return [];
  }
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Products!A2:J',
    });
    
    const rows = response.data.values || [];
    
    return rows.map((row) => ({
      id: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      price: parseFloat(row[3]) || 0,
      category: (row[4] as 'men' | 'women' | 'children') || 'men',
      imageUrl: row[5] || '',
      sizes: row[6] ? row[6].split(',').map((s: string) => s.trim()) : [],
      colors: row[7] ? row[7].split(',').map((c: string) => c.trim()) : [],
      featured: row[8] === 'true',
      createdAt: row[9] || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Get a single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

// Get featured product
export async function getFeaturedProduct(): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.featured) || products[0] || null;
}

// Add a new product
export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SPREADSHEET_ID not set');
  }
  
  const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();
  
  const newProduct: Product = {
    ...product,
    id,
    createdAt,
  };
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Products!A:J',
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          newProduct.id,
          newProduct.name,
          newProduct.description,
          newProduct.price,
          newProduct.category,
          newProduct.imageUrl,
          newProduct.sizes.join(','),
          newProduct.colors.join(','),
          newProduct.featured.toString(),
          newProduct.createdAt,
        ],
      ],
    },
  });
  
  return newProduct;
}

// Update a product
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SPREADSHEET_ID not set');
  }
  
  // Get all products to find the row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Products!A:A',
  });
  
  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);
  
  if (rowIndex === -1) {
    return null;
  }
  
  // Get current product data
  const currentResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `Products!A${rowIndex + 1}:J${rowIndex + 1}`,
  });
  
  const currentRow = currentResponse.data.values?.[0] || [];
  
  const updatedProduct: Product = {
    id: currentRow[0] || id,
    name: updates.name ?? currentRow[1] ?? '',
    description: updates.description ?? currentRow[2] ?? '',
    price: updates.price ?? parseFloat(currentRow[3]) ?? 0,
    category: updates.category ?? (currentRow[4] as 'men' | 'women' | 'children') ?? 'men',
    imageUrl: updates.imageUrl ?? currentRow[5] ?? '',
    sizes: updates.sizes ?? (currentRow[6] ? currentRow[6].split(',').map((s: string) => s.trim()) : []),
    colors: updates.colors ?? (currentRow[7] ? currentRow[7].split(',').map((c: string) => c.trim()) : []),
    featured: updates.featured ?? currentRow[8] === 'true',
    createdAt: updates.createdAt ?? currentRow[9] ?? new Date().toISOString(),
  };
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Products!A${rowIndex + 1}:J${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          updatedProduct.id,
          updatedProduct.name,
          updatedProduct.description,
          updatedProduct.price,
          updatedProduct.category,
          updatedProduct.imageUrl,
          updatedProduct.sizes.join(','),
          updatedProduct.colors.join(','),
          updatedProduct.featured.toString(),
          updatedProduct.createdAt,
        ],
      ],
    },
  });
  
  return updatedProduct;
}

// Delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SPREADSHEET_ID not set');
  }
  
  // Get all products to find the row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Products!A:A',
  });
  
  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);
  
  if (rowIndex === -1) {
    return false;
  }
  
  // Delete the row by setting empty values
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `Products!A${rowIndex + 1}:J${rowIndex + 1}`,
  });
  
  return true;
}

// Upload image to Google Drive
export async function uploadImageToDrive(
  file: File,
  fileName: string
): Promise<string> {
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');
  }
  
  const buffer = await file.arrayBuffer();
  const nodeBuffer = Buffer.from(buffer);
  const stream = Readable.from(nodeBuffer);
  
  let response;
  try {
    response = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
    });
  } catch (error: any) {
    const status = error?.code || error?.status || error?.response?.status;
    if (status === 404) {
      throw new Error(
        `Google Drive folder not found or not shared with service account: ${folderId}`
      );
    }

    throw error;
  }
  
  const fileId = response.data.id;
  
  // Make the file public
  await drive.permissions.create({
    fileId: fileId!,
    supportsAllDrives: true,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
  
  // Return the public URL
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// Initialize spreadsheet with headers (run once)
export async function initializeSpreadsheet(): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SPREADSHEET_ID not set');
  }
  
  // Check if headers exist
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Products!A1:J1',
  });
  
  if (!response.data.values || response.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Products!A1:J1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [SHEET_HEADERS],
      },
    });
  }
}
