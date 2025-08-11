/**
 * This file contains all the dynamic details for your organization.
 * Edit these values to change the content on all generated PDF documents.
 * This allows for easy updates without touching the main application code.
 */

const organizationDetails = {
    // General Organization Details
    name: "Pixel Push Software Agency",
    address: "123 Ahmedabad Road, Tech City, 12345",
    website: "www.techsolutions.com",
    phone: "+1 (555) 123-4567",
    email: "hr@pushpixelsoftwareagency.com",

    // --- Signer Roles ---
    // This person signs documents like Offer Letters.
    signerName: "Jane Doe",
    signerTitle: "Head of Talent Acquisition",

    // This person signs official documents like Certificates.
    ceoName: "Richard Hendricks",
    ceoTitle: "Chief Executive Officer",
    
    // --- Fallback Details ---
    // Default values for internship/project details if not provided by the admin in the form.
    defaultProjectDetails: "various internal projects",
    defaultProjectGoal: "gain practical industry experience",
    defaultInternContribution: "various front-end and back-end tasks",
    defaultInternImpact: "a positive addition to our project timelines",
    defaultSupervisorName: "John Appleseed",
    defaultSupervisorTitle: "Lead Project Manager",
    defaultInternshipDuration: "3 Months",
    defaultStipend: "a competitive monthly stipend",
    defaultWorkingHours: "40 hours per week, Monday to Friday",
    defaultAcceptanceDeadline: "one week from the date of this letter",
};

export default organizationDetails;