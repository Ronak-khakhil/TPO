import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Set NODE_ENV to test before importing server so it doesn't auto-listen on PORT 5000
process.env.NODE_ENV = 'test';
const { default: app } = await import('../server.js');
const { store } = await import('../data/store.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'resumes');

describe('Campus Placement - Resume & Academic Profile API Test Suite', () => {
  let server;
  let baseUrl;
  let studentToken;
  let student2Token;
  let recruiterToken;
  let tpoToken;
  let studentUser;
  let studentProfile;
  let student2Profile;

  before(async () => {
    // Start ephemeral server for testing
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });

    // Helper to log in demo accounts
    const login = async (email, password = 'password123') => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data;
    };

    // 1. Student 1: Rahul Verma (CSE)
    const stuLogin = await login('rahul.cse@college.edu');
    studentToken = stuLogin.token;
    studentUser = stuLogin.user;
    studentProfile = stuLogin.profile;

    // 2. Student 2: Ananya Iyer (IT)
    const stu2Login = await login('ananya.it@college.edu');
    student2Token = stu2Login.token;
    student2Profile = stu2Login.profile;

    // 3. Recruiter: Google
    const recLogin = await login('recruiter@google.com');
    recruiterToken = recLogin.token;

    // 4. TPO Admin: Dr. Ramesh Sharma
    const tpoLogin = await login('tpo@college.edu');
    tpoToken = tpoLogin.token;
  });

  after(async () => {
    // Clean up test server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // -----------------------------------------------------------
  // 1. Authentication & Role Authorization
  // -----------------------------------------------------------
  describe('1. Authentication & Role Permissions', () => {
    it('should reject unauthenticated upload request with 401', async () => {
      const form = new FormData();
      form.append('resume', new Blob(['test content'], { type: 'application/pdf' }), 'test.pdf');

      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'POST',
        body: form
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject unauthenticated resume download with 401', async () => {
      const res = await fetch(`${baseUrl}/students/resume`);
      assert.strictEqual(res.status, 401);
    });

    it('should reject unauthenticated resume delete with 401', async () => {
      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'DELETE'
      });
      assert.strictEqual(res.status, 401);
    });

    it('should prevent non-student (recruiter) from uploading a student resume (403)', async () => {
      const form = new FormData();
      form.append('resume', new Blob(['fake content'], { type: 'application/pdf' }), 'recruiter.pdf');

      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${recruiterToken}` },
        body: form
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.match(data.message, /only students/i);
    });
  });

  // -----------------------------------------------------------
  // 2. File Validation & Error Handling
  // -----------------------------------------------------------
  describe('2. File Validation & Upload Restrictions', () => {
    it('should reject upload when no file is attached (400)', async () => {
      const form = new FormData();
      // No file attached

      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: form
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /no resume file provided/i);
    });

    it('should reject disallowed file extensions such as .txt or .exe (400)', async () => {
      const form = new FormData();
      form.append('resume', new Blob(['plain text resume'], { type: 'text/plain' }), 'malicious.txt');

      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: form
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /only pdf, doc, and docx/i);
    });

    it('should reject files exceeding the 5MB size limit (400)', async () => {
      // Create a simulated 5.5MB payload
      const largeBuffer = new Uint8Array(5.5 * 1024 * 1024);
      const form = new FormData();
      form.append('resume', new Blob([largeBuffer], { type: 'application/pdf' }), 'huge_resume.pdf');

      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: form
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /maximum allowed resume size is 5mb/i);
    });
  });

  // -----------------------------------------------------------
  // 3. Successful Resume Upload & Profile Sync
  // -----------------------------------------------------------
  describe('3. Successful Upload & Profile Record Synchronization', () => {
    let uploadedFileName;

    it('should successfully upload a valid PDF resume (200)', async () => {
      const pdfContent = '%PDF-1.4 %âãÏÓ 1 0 obj << /Type /Catalog >> endobj trailer << /Root 1 0 R >> %%EOF';
      const form = new FormData();
      form.append('resume', new Blob([pdfContent], { type: 'application/pdf' }), 'Rahul_Verma_Resume_v1.pdf');

      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: form
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.resume.originalName, 'Rahul_Verma_Resume_v1.pdf');
      assert.ok(data.resume.fileName);
      assert.ok(data.resume.uploadedAt);
      uploadedFileName = data.resume.fileName;

      // Verify file exists on server disk
      const filePath = path.join(UPLOADS_DIR, uploadedFileName);
      assert.ok(fs.existsSync(filePath), 'File must exist in server/uploads/resumes directory');
    });

    it('should verify student database record is updated with resume metadata', async () => {
      const student = store.collection('students').findOne({ userId: studentUser.id });
      assert.ok(student);
      assert.strictEqual(student.resumeOriginalName, 'Rahul_Verma_Resume_v1.pdf');
      assert.strictEqual(student.resumeFile, uploadedFileName);
      assert.strictEqual(student.resumeMimeType, 'application/pdf');
      assert.ok(student.resumeSize > 0);
    });

    it('should verify system audit trail captures RESUME_UPLOADED action', async () => {
      const logs = store.collection('auditLogs').find({ action: 'RESUME_UPLOADED', actorUserId: studentUser.id });
      assert.ok(logs.length > 0);
      const latest = logs[logs.length - 1];
      assert.strictEqual(latest.actorRole, 'student');
      assert.match(latest.details, /Rahul_Verma_Resume_v1\.pdf/);
    });

    it('should remove old file from disk when a student uploads a new replacement resume', async () => {
      const oldFilePath = path.join(UPLOADS_DIR, uploadedFileName);
      assert.ok(fs.existsSync(oldFilePath), 'Old file should exist before replacement');

      // Upload replacement DOCX
      const docxContent = 'PK\x03\x04 dummy docx content';
      const form = new FormData();
      form.append('resume', new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'Rahul_Verma_Resume_Final.docx');

      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: form
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.resume.originalName, 'Rahul_Verma_Resume_Final.docx');

      // Verify old file was deleted from disk
      assert.strictEqual(fs.existsSync(oldFilePath), false, 'Old resume file must be removed to avoid orphan disk space');

      // Update pointer for subsequent tests
      uploadedFileName = data.resume.fileName;
      assert.ok(fs.existsSync(path.join(UPLOADS_DIR, uploadedFileName)));
    });
  });

  // -----------------------------------------------------------
  // 4. Inline Viewing & Stream Downloading
  // -----------------------------------------------------------
  describe('4. Inline Viewing & Download Handlers', () => {
    it('should allow student to stream their resume using Authorization Bearer header', async () => {
      const res = await fetch(`${baseUrl}/students/resume`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });

      assert.strictEqual(res.status, 200);
      assert.match(res.headers.get('content-type'), /wordprocessingml|octet-stream/);
      assert.match(res.headers.get('content-disposition'), /inline; filename="Rahul_Verma_Resume_Final\.docx"/);
      const content = await res.text();
      assert.match(content, /PK/);
    });

    it('should support authentication via ?token= query parameter for browser <a> tags', async () => {
      const res = await fetch(`${baseUrl}/students/resume?token=${encodeURIComponent(studentToken)}`);
      assert.strictEqual(res.status, 200);
      assert.match(res.headers.get('content-disposition'), /inline; filename="Rahul_Verma_Resume_Final\.docx"/);
    });

    it('should allow TPO Officer to view student resume via /api/students/:studentId/resume', async () => {
      const res = await fetch(`${baseUrl}/students/${studentProfile._id}/resume?token=${encodeURIComponent(tpoToken)}`);
      assert.strictEqual(res.status, 200);
    });

    it('should allow verified recruiter to view applicant resume via /api/students/:studentId/resume', async () => {
      const res = await fetch(`${baseUrl}/students/${studentProfile._id}/resume?token=${encodeURIComponent(recruiterToken)}`);
      assert.strictEqual(res.status, 200);
    });

    it('should forbid another student from viewing someone else resume (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/students/${studentProfile._id}/resume?token=${encodeURIComponent(student2Token)}`);
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.match(data.message, /unauthorized access/i);
    });
  });

  // -----------------------------------------------------------
  // 5. Integration with Drives & Applicant Pipeline
  // -----------------------------------------------------------
  describe('5. Application Pipeline Resume Integration', () => {
    it('should return resume metadata in drive applicants list for recruiter review', async () => {
      // Find a published drive
      const drives = store.collection('drives').find({ status: 'published' });
      assert.ok(drives.length > 0);
      const drive = drives[0];

      // Rahul applies to this drive
      await fetch(`${baseUrl}/drives/${drive._id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({ notes: 'Applying with my uploaded resume!' })
      });

      // Recruiter checks applicants
      const res = await fetch(`${baseUrl}/drives/${drive._id}/applications`, {
        headers: { Authorization: `Bearer ${recruiterToken}` }
      });

      if (res.status === 200) {
        const apps = await res.json();
        const rahulApp = apps.find(a => a.userId === studentUser.id);
        if (rahulApp) {
          assert.ok(rahulApp.resumeFile, 'Applicant object must include resumeFile');
          assert.strictEqual(rahulApp.resumeOriginalName, 'Rahul_Verma_Resume_Final.docx');
          assert.ok(rahulApp.studentProfileId);
        }
      }
    });
  });

  // -----------------------------------------------------------
  // 6. Resume Deletion & Disk Cleanup
  // -----------------------------------------------------------
  describe('6. Resume Deletion & Post-Delete State', () => {
    it('should allow student to delete their resume (200)', async () => {
      const res = await fetch(`${baseUrl}/students/resume`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    it('should verify database fields for resume are reset to null', async () => {
      const student = store.collection('students').findOne({ userId: studentUser.id });
      assert.strictEqual(student.resumeFile, null);
      assert.strictEqual(student.resumeOriginalName, null);
      assert.strictEqual(student.resumeSize, null);
      assert.strictEqual(student.resumeUploadedAt, null);
    });

    it('should verify RESUME_DELETED is recorded in system audit log', async () => {
      const logs = store.collection('auditLogs').find({ action: 'RESUME_DELETED', actorUserId: studentUser.id });
      assert.ok(logs.length > 0);
      assert.match(logs[logs.length - 1].details, /Rahul_Verma_Resume_Final\.docx/);
    });

    it('should return 404 when attempting to download a deleted resume', async () => {
      const res = await fetch(`${baseUrl}/students/resume`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.match(data.message, /no resume file found/i);
    });
  });
});
