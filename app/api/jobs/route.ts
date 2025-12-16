import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const JOBS_FILE = path.join(process.cwd(), 'data', 'jobs.json');
const DATA_FILE = path.join(process.cwd(), 'data', 'data.json');

async function initializeJobsFile() {
  try {
    await fs.access(JOBS_FILE);
  } catch {
    const dataDir = path.dirname(JOBS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(JOBS_FILE, JSON.stringify([], null, 2));
  }
}

function flattenTasks(obj: any, prefix = ''): any {
  const tasks: any = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(obj[key])) {
      obj[key].forEach((task: string, index: number) => {
        tasks[`${fullKey}.${index}`] = {
          category: fullKey,
          task: task,
          completed: false
        };
      });
    } else if (typeof obj[key] === 'object') {
      Object.assign(tasks, flattenTasks(obj[key], fullKey));
    }
  }
  return tasks;
}

export async function GET() {
  try {
    await initializeJobsFile();
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    const jobs = JSON.parse(data);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error reading jobs:', error);
    return NextResponse.json({ error: 'Failed to read jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeJobsFile();
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    const jobs = JSON.parse(data);
    const body = await request.json();

    const newJob = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy,
      workerName: body.workerName,
      workType: body.workType,
      tasks: {},
      completed: false
    };

    // Load task structure from data.json
    const dataContent = await fs.readFile(DATA_FILE, 'utf8');
    const procedures = JSON.parse(dataContent);
    const workTypeData = procedures.IT_Onboarding_Proseduru[body.workType];

    if (workTypeData) {
      newJob.tasks = flattenTasks(workTypeData);
    }

    jobs.push(newJob);
    await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
    return NextResponse.json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

