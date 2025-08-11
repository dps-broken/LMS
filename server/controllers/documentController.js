import asyncHandler from 'express-async-handler';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { format } from 'date-fns';

// Import local modules and configurations
import Document from '../models/Document.js';
import User from '../models/User.js';
import InternshipApplication from '../models/InternshipApplication.js';
import { sendDocumentEmail } from '../services/emailService.js';
import orgDetails from '../config/organization.config.js';

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- ADMIN CONTROLLERS ---

/**
 * Generates a PDF document (Certificate or Offer Letter), saves it,
 * records it in the database, and emails it to the student.
 * It dynamically populates an HTML template with data from the request body,
 * the student's profile, and the global organization configuration file.
 */
const generateDocument = asyncHandler(async (req, res) => {
    // 1. Destructure all possible fields from the request body sent by the admin form.
    const { 
        studentId, type, title,
        // Certificate-specific details from the form
        pronounHeShe, pronounHisHer, projectDetails, projectGoal, internContribution, internImpact, internshipEndDate,
        // Offer Letter-specific details from the form
        studentAddress, internshipDuration, stipend, workingHours, supervisorName, supervisorTitle, acceptanceDeadline
    } = req.body;

    // 2. Fetch the full student, batch, and department details from the database.
    const student = await User.findById(studentId).populate('batch').populate('department');
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // 3. Determine the correct HTML template file and verify it exists.
    const templateFileName = type === 'offer_letter' ? 'offer_letter.html' : 'certificate.html';
    const templatePath = path.join(__dirname, `../templates/${templateFileName}`);
    if (!fs.existsSync(templatePath)) {
        console.error(`Template file not found at path: ${templatePath}`);
        throw new Error(`Template file not found: ${templateFileName}`);
    }
    let html = fs.readFileSync(templatePath, 'utf8');
    
    // 4. Consolidate all data for injection into the template.
    //    This object merges data from multiple sources: the form, the database, and the config file.
    const documentData = {
        // --- Universal Data ---
        studentName: student.fullName,
        courseName: title, // Represents "Position Name" in offer letters
        batchName: student.batch.name,
        issueDate: format(new Date(), 'MMMM do, yyyy'),
        documentId: `DOC-${Date.now()}`,
        department: student.department?.name || 'Assigned Department',

        // --- Organization Data (from config) ---
        orgName: orgDetails.name,
        orgAddress: orgDetails.address,
        orgWebsite: orgDetails.website,
        orgPhone: orgDetails.phone,
        orgEmail: orgDetails.email,
        
        // --- Role-Specific Signer Data (from config) ---
        signerName: orgDetails.signerName,   // For Offer Letters (e.g., HR Manager)
        signerTitle: orgDetails.signerTitle,
        ceoName: orgDetails.ceoName,         // For Certificates (e.g., CEO)
        ceoTitle: orgDetails.ceoTitle,

        // --- Certificate-Specific Data (with fallbacks to defaults) ---
        studentHeShe: pronounHeShe || 'They',
        studentHisHer: pronounHisHer || 'Their',
        projectDetails: projectDetails || orgDetails.defaultProjectDetails,
        projectGoal: projectGoal || orgDetails.defaultProjectGoal,
        internContribution: internContribution || orgDetails.defaultInternContribution,
        internImpact: internImpact || orgDetails.defaultInternImpact,
        internshipEndDate: internshipEndDate 
            ? format(new Date(internshipEndDate), 'MMMM do, yyyy') 
            : format(new Date(student.batch.endTime), 'MMMM do, yyyy'), // Fallback to batch end date
        
        // --- Offer Letter-Specific Data (with fallbacks to defaults) ---
        studentAddress: studentAddress || '[Student Address Not Provided]',
        internshipDuration: internshipDuration || orgDetails.defaultInternshipDuration,
        stipend: stipend || orgDetails.defaultStipend,
        workingHours: workingHours || orgDetails.defaultWorkingHours,
        'Supervisor\'s Name': supervisorName || orgDetails.defaultSupervisorName,
        'Supervisor\'s Title': supervisorTitle || orgDetails.defaultSupervisorTitle,
        acceptanceDeadline: acceptanceDeadline 
            ? format(new Date(acceptanceDeadline), 'MMMM do, yyyy') 
            : orgDetails.defaultAcceptanceDeadline,
        'Start Date': format(new Date(student.batch.startTime), 'MMMM do, yyyy'), // Use batch start date
    };

    // 5. Replace all placeholders in the HTML template.
    for (const key in documentData) {
        // Using a global regex to replace all instances of a placeholder, e.g., {{orgName}}
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, documentData[key] || ''); // Fallback to empty string
    }
    
    // 6. Generate the PDF using Puppeteer.
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    
    // 7. Save the PDF to the server's filesystem.
    const outputDir = path.join(__dirname, '../uploads/documents/');
    await fs.ensureDir(outputDir);
    const pdfPath = path.join(outputDir, `${documentData.documentId}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);
    
    // 8. Create a record of the generated document in the database.
    const fileUrl = `/uploads/documents/${documentData.documentId}.pdf`;
    const docRecord = await Document.create({ 
        student: studentId, 
        type, 
        title, 
        fileUrl, 
        batchName: student.batch.name 
    });

    // 9. Email the document to the student.
    await sendDocumentEmail(student.email, `Your ${title} from ${orgDetails.name}`, pdfBuffer, `${title.replace(/\s+/g, '_')}.pdf`);
    
    // 10. Send a success response.
    res.status(201).json({ message: 'Document generated and sent successfully.', document: docRecord });
});

// @desc    Get a log of all generated documents
// @route   GET /api/admin/documents
// @access  Private/Admin
const getAllDocuments = asyncHandler(async (req, res) => {
    const documents = await Document.find({})
        .populate('student', 'fullName email')
        .sort({ createdAt: -1 });
    res.json(documents);
});


// --- STUDENT CONTROLLERS ---

// @desc    Get all documents for the logged-in student
// @route   GET /api/student/documents
// @access  Private/Student
const getDocumentsForStudent = asyncHandler(async (req, res) => {
    const documents = await Document.find({ student: req.user._id }).sort({ issueDate: -1 });
    res.json(documents);
});

// @desc    Accept an internship offer letter
// @route   PUT /api/student/documents/offer/:id/accept
// @access  Private/Student
const acceptOfferLetter = asyncHandler(async (req, res) => {
    const document = await Document.findById(req.params.id);

    if (!document || document.student.toString() !== req.user._id.toString() || document.type !== 'offer_letter') {
        res.status(404);
        throw new Error('Offer letter not found or invalid.');
    }
    
    const user = await User.findById(req.user._id);
    user.internshipStatus = 'accepted';
    await user.save();
    
    await InternshipApplication.findOneAndUpdate({student: req.user._id}, {status: 'accepted'});

    res.json({ message: 'Offer accepted successfully! Your status has been updated.' });
});

export {
    generateDocument,
    getAllDocuments,
    getDocumentsForStudent,
    acceptOfferLetter,
};