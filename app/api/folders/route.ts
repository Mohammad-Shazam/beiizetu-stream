//app/api/folders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const FOLDERS_FILE = join(process.cwd(), 'data', 'folders.json');

// Get folders
export async function GET() {
  try {
    console.log('API: Folders endpoint called');
    
    let folders = [];
    try {
      const data = await readFile(FOLDERS_FILE, 'utf8');
      folders = JSON.parse(data);
      console.log('API: Successfully read', folders.length, 'folders');
    } catch (error) {
      console.log('API: No folders file found, creating default');
      // Create default folders if file doesn't exist
      folders = [
        { id: 'root', name: 'Root', parentId: null }
      ];
      await writeFile(FOLDERS_FILE, JSON.stringify(folders, null, 2));
    }

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch folders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Create folder
export async function POST(request: NextRequest) {
  try {
    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // Read existing folders
    let folders = [];
    try {
      const data = await readFile(FOLDERS_FILE, 'utf8');
      folders = JSON.parse(data);
    } catch (error) {
      folders = [{ id: 'root', name: 'Root', parentId: null }];
    }

    // Create new folder
    const newFolder = {
      id: uuidv4(),
      name,
      parentId: parentId || 'root'
    };

    folders.push(newFolder);
    await writeFile(FOLDERS_FILE, JSON.stringify(folders, null, 2));

    console.log('API: Created folder:', newFolder);

    return NextResponse.json({ folder: newFolder });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to create folder',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}