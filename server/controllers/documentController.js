// ... (Keep all imports at the top, including puppeteer, chrome, fs, path, etc.)
import asyncHandler from 'express-async-handler';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core'; // puppeteer-core
import chrome from 'chrome-aws-lambda'; // chrome-aws-lambda package
import { format } from 'date-fns';
import Document from '../models/Document.js';
import User from '../models/User.js';
import { sendDocumentEmail } from '../services/emailService.js';
import InternshipApplication from '../models/InternshipApplication.js';
import orgDetails from '../config/organization.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Generates a PDF document (Certificate or Offer Letter) using Puppeteer.
 *          Dynamically populates an HTML template with student and organization data.
 * @route   POST /api/admin/documents/generate
 * @access  Private/Admin
 */
const generateDocument = asyncHandler(async (req, res) => {
    const { 
        studentId, type, title,
        pronounHeShe, pronounHisHer, projectDetails, projectGoal, internContribution, internImpact, internshipEndDate,
        studentAddress, internshipDuration, stipend, workingHours, supervisorName, supervisorTitle, acceptanceDeadline
    } = req.body;

    const student = await User.findById(studentId).populate('batch').populate('department');
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    let templateFileName = type === 'offer_letter' ? 'offer_letter.html' : 'certificate.html';
    const templatePath = path.join(__dirname, `../templates/${templateFileName}`);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templateFileName}`);
    }
    let html = fs.readFileSync(templatePath, 'utf8');
    
    const documentData = {
        studentName: student.fullName, courseName: title,
        batchName: student.batch?.name || 'N/A', issueDate: format(new Date(), 'MMMM do, yyyy'),
        documentId: `DOC-${Date.now()}`, department: student.department?.name || 'N/A',
        orgName: orgDetails.name, orgAddress: orgDetails.address, orgWebsite: orgDetails.website,
        orgPhone: orgDetails.phone, orgEmail: orgDetails.email,
        signerName: type === 'offer_letter' ? orgDetails.signerName : orgDetails.ceoName,
        signerTitle: type === 'offer_letter' ? orgDetails.signerTitle : orgDetails.ceoTitle,
        studentHeShe: pronounHeShe || 'They', studentHisHer: pronounHisHer || 'Their',
        projectDetails: projectDetails || orgDetails.defaultProjectDetails,
        projectGoal: projectGoal || orgDetails.defaultProjectGoal,
        internContribution: internContribution || orgDetails.defaultInternContribution,
        internImpact: internImpact || orgDetails.defaultInternImpact,
        internshipEndDate: internshipEndDate 
            ? format(new Date(internshipEndDate), 'MMMM do, yyyy') 
            : format(new Date(student.batch?.endTime || Date.now()), 'MMMM do, yyyy'),
        studentAddress: studentAddress || '[Student Address Not Provided]',
        internshipDuration: internshipDuration || orgDetails.defaultInternshipDuration,
        stipend: stipend || orgDetails.defaultStipend,
        workingHours: workingHours || orgDetails.defaultWorkingHours,
        'Supervisor\'s Name': supervisorName || orgDetails.defaultSupervisorName,
        'Supervisor\'s Title': supervisorTitle || orgDetails.defaultSupervisorTitle,
        acceptanceDeadline: acceptanceDeadline 
            ? format(new Date(acceptanceDeadline), 'MMMM do, yyyy') 
            : orgDetails.defaultAcceptanceDeadline,
        'Start Date': format(new Date(student.batch?.startTime || Date.now()), 'MMMM do, yyyy'),
    };

    for (const key in documentData) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, documentData[key] || '');
    }
    
    // --- CORRECT PUPPETEER LAUNCH ARGS ---
    // Explicitly provide executablePath and args as per chrome-aws-lambda requirements.
    const browser = await puppeteer.launch({ 
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });
    // ------------------------------------
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    
    const outputDir = path.join(__dirname, '../uploads/documents/');
    await fs.ensureDir(outputDir);
    const pdfPath = path.join(outputDir, `${documentData.documentId}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);
    
    const fileUrl = `/uploads/documents/${documentData.documentId}.pdf`;
    const docRecord = await Document.create({ student: studentId, type, title, fileUrl, batchName: student.batch?.name || 'N/A' });
    
    await sendDocumentEmail(student.email, `Your ${title} from ${orgDetails.name}`, pdfBuffer, `${title.replace(/\s+/g, '_')}.pdf`);
    
    res.status(201).json({ message: 'Document generated and sent successfully.', document: docRecord });
});

const getAllDocuments = asyncHandler(async (req, res) => { /* ... existing code ... */ });
const getDocumentsForStudent = asyncHandler(async (req, res) => { /* ... existing code ... */ });
const acceptOfferLetter = asyncHandler(async (req, res) => { /* ... existing code ... */ });

export {
    generateDocument,
    getAllDocuments,
    getDocumentsForStudent,
    acceptOfferLetter,
};