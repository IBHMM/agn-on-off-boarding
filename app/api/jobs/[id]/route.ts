import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const STORAGE_DIR = process.env.TMPDIR || os.tmpdir();
const JOBS_FILE = path.join(STORAGE_DIR, 'jobs.json');

async function initializeJobsFile() {
  try {
    await fs.access(JOBS_FILE);
  } catch {
    const dataDir = path.dirname(JOBS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(JOBS_FILE, JSON.stringify([], null, 2));
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await initializeJobsFile();
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    const jobs = JSON.parse(data);
    const job = jobs.find((j: any) => j.id === id);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error reading job:', error);
    return NextResponse.json({ error: 'Failed to read job' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await initializeJobsFile();
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    const jobs = JSON.parse(data);
    const jobIndex = jobs.findIndex((j: any) => j.id === id);
    
    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await request.json();
    jobs[jobIndex] = { ...jobs[jobIndex], ...body };
    await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
    return NextResponse.json(jobs[jobIndex]);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await initializeJobsFile();
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    let jobs = JSON.parse(data);
    jobs = jobs.filter((j: any) => j.id !== id);
    await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}