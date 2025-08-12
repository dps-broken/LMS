import asyncHandler from 'express-async-handler';
import fs from 'fs-extra'; // Used for file system operations like creating directories and writing files
import path from 'path';
import { fileURLToPath } from 'url'; // Helper for getting __dirname in ES modules
import puppeteer from 'puppeteer-core'; // Using puppeteer-core for browserless execution
import chrome from 'chrome-aws-lambda'; // Module that provides a headless browser executable
import { format } from 'date-fns'; // For formatting dates

// Import local modules and configurations
import Document from '../models/Document.js';
import User from '../models/User.js';
import InternshipApplication from '../models/InternshipApplication.js';
import { sendDocumentEmail } from '../services/emailService.js'; // Email utility service
import orgDetails from '../config/organization.config.js'; // Organization details configuration

// Resolve the current file's directory to correctly join other paths.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Generates a PDF document (Certificate or Offer Letter), saves it to the server,
 *          records it in the database, and emails it to the student.
 * @route   POST /api/admin/documents/generate
 * @access  Private/Admin
 */
const generateDocument = asyncHandler(async (req, res) => {
    // Destructure all possible fields from the request body.
    // These fields come from the frontend form.
    const { 
        studentId, type, title, // Basic info
        pronounHeShe, pronounHisHer, projectDetails, projectGoal, internContribution, internImpact, internshipEndDate, // Certificate-specific
        studentAddress, internshipDuration, stipend, workingHours, supervisorName, supervisorTitle, acceptanceDeadline // Offer Letter-specific
    } = req.body;

    // --- Step 1: Fetch Student Data ---
    // Find the student by ID and populate their batch and department for contextual data.
    const student = await User.findById(studentId).populate('batch').populate('department');
    if (!student) {
        res.status(404);
        throw new Error('Student not found.');
    }
    
    // --- Step 2: Determine the Correct HTML Template ---
    // Select the appropriate template file based on the 'type' sent from the frontend.
    let templateFileName = type === 'offer_letter' ? 'offer_letter.html' : 'certificate.html';
    const templatePath = path.join(__dirname, `../templates/${templateFileName}`);

    // Safety check: Ensure the template file actually exists on the server.
    if (!fs.existsSync(templatePath)) {
        console.error(`Template file not found at path: ${templatePath}`);
        res.status(404);
        throw new Error(`Template file not found: ${templateFileName}`);
    }
    // Read the HTML content of the selected template file.
    let html = fs.readFileSync(templatePath, 'utf8');
    
    // --- Step 3: Prepare Dynamic Data for Injection ---
    // Consolidate all data needed for the document. It merges form data,
    // student details, and organization defaults.
    const documentData = {
        // Universal Data (available for both certificate and offer letter)
        studentName: student.fullName,
        courseName: title, // This will be the "Position Name" for offer letters
        batchName: student.batch?.name || 'N/A', // Safely get batch name
        issueDate: format(new Date(), 'MMMM do, yyyy'),
        documentId: `DOC-${Date.now()}`,
        department: student.department?.name || 'N/A', // Safely get department name

        // Organization Data (from the config file)
        orgName: orgDetails.name,
        orgAddress: orgDetails.address,
        orgWebsite: orgDetails.website,
        orgPhone: orgDetails.phone,
        orgEmail: orgDetails.email,
        
        // Signer details based on document type (from config file)
        signerName: type === 'offer_letter' ? orgDetails.signerName : orgDetails.ceoName,
        signerTitle: type === 'offer_letter' ? orgDetails.signerTitle : orgDetails.ceoTitle,

        // Certificate-Specific Data (with fallbacks to defaults from orgDetails)
        studentHeShe: pronounHeShe || 'They',
        studentHisHer: pronounHisHer || 'Their',
        projectDetails: projectDetails || orgDetails.defaultProjectDetails,
        projectGoal: projectGoal || orgDetails.defaultProjectGoal,
        internContribution: internContribution || orgDetails.defaultInternContribution,
        internImpact: internImpact || orgDetails.defaultInternImpact,
        internshipEndDate: internshipEndDate 
            ? format(new Date(internshipEndDate), 'MMMM do, yyyy') 
            : format(new Date(student.batch?.endTime || Date.now()), 'MMMM do, yyyy'), // Fallback to batch end date or now
        
        // Offer Letter-Specific Data (with fallbacks to defaults from orgDetails)
        studentAddress: studentAddress || '[Student Address Not Provided]',
        internshipDuration: internshipDuration || orgDetails.defaultInternshipDuration,
        stipend: stipend || orgDetails.defaultStipend,
        workingHours: workingHours || orgDetails.defaultWorkingHours,
        'Supervisor\'s Name': supervisorName || orgDetails.defaultSupervisorName,
        'Supervisor\'s Title': supervisorTitle || orgDetails.defaultSupervisorTitle,
        acceptanceDeadline: acceptanceDeadline 
            ? format(new Date(acceptanceDeadline), 'MMMM do, yyyy') 
            : orgDetails.defaultAcceptanceDeadline,
        'Start Date': format(new Date(student.batch?.startTime || Date.now()), 'MMMM do, yyyy'), // Use batch start date or now
    };

    // 5. Replace all placeholders (e.g., {{studentName}}) in the HTML string with the actual data.
    for (const key in documentData) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        // Use empty string as a fallback if a value is undefined/null to prevent errors.
        html = html.replace(regex, documentData[key] || ''); 
    }
    
    // --- Step 6: Generate PDF using Puppeteer ---
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necessary for many server environments
    });
    const page = await browser.newPage();
    
    // Set the HTML content and wait for the page to be ready
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Generate the PDF buffer
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close(); // Close the browser to free up resources
    
    // --- Step 7: Save the PDF to the Server's File System ---
    const outputDir = path.join(__dirname, '../uploads/documents/');
    await fs.ensureDir(outputDir); // Ensure the directory exists (creates it if not)
    const pdfPath = path.join(outputDir, `${documentData.documentId}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);
    
    // --- Step 8: Create a record of this document in the database ---
    const fileUrl = `/uploads/documents/${documentData.documentId}.pdf`;
    const docRecord = await Document.create({ 
        student: studentId, 
        type, 
        title, 
        fileUrl, 
        batchName: student.batch?.name || 'N/A' // Safely get batch name
    });

    // --- Step 9: Email the generated PDF to the student ---
    await sendDocumentEmail(student.email, `Your ${title} from ${orgDetails.name}`, pdfBuffer, `${title.replace(/\s+/g, '_')}.pdf`);
    
    // --- Step 10: Send a success response ---
    res.status(201).json({ message: 'Document generated and sent successfully.', document: docRecord });
});

/**
 * @desc    Get a log of all generated documents
 * @route   GET /api/admin/documents
 * @access  Private/Admin
 */
const getAllDocuments = asyncHandler(async (req, res) => {
    // Fetch all documents and populate student details for better display.
    const documents = await Document.find({})
        .populate('student', 'fullName email')
        .sort({ createdAt: -1 });
    res.json(documents);
});


// --- STUDENT CONTROLLERS ---

/**
 * @desc    Get all documents for the currently logged-in student
 * @route   GET /api/student/documents
 * @access  Private/Student
 */
const getDocumentsForStudent = asyncHandler(async (req, res) => {
    // Find all documents specifically linked to the logged-in student.
    const documents = await Document.find({ student: req.user._id }).sort({ issueDate: -1 });
    res.json(documents);
});

/**
 * @desc    Handle the student's acceptance of an internship offer letter.
 * @route   PUT /api/student/documents/offer/:id/accept
 * @access  Private/Student
 */
const acceptOfferLetter = asyncHandler(async (req, res) => {
    // Find the specific offer letter document by ID.
    const document = await Document.findById(req.params.id);

    // Security checks: ensure the document exists, belongs to the student, and is an offer letter.
    if (!document || document.student.toString() !== req.user._id.toString() || document.type !== 'offer_letter') {
        res.status(404);
        throw new Error('Offer letter not found or invalid.');
    }
    
    // Find the user and update their internship status.
    const user = await User.findById(req.user._id);
    user.internshipStatus = 'accepted';
    const updatedUser = await user.save();
    
    // Also update the status on the internship application record for consistency.
    await InternshipApplication.findOneAndUpdate({ student: req.user._id }, { status: 'accepted' });

    // Send back a success message and the updated status for immediate UI updates.
    res.json({ 
        message: 'Offer accepted successfully! Your status has been updated.',
        internshipStatus: updatedUser.internshipStatus 
    });
});

// Export all the functions from this controller.
export {
    generateDocument,
    getAllDocuments,
    getDocumentsForStudent,
    acceptOfferLetter,
};