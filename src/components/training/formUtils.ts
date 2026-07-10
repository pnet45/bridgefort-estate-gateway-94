
import { TrainingFormValues } from "./types";

export const handleFormSubmission = (data: TrainingFormValues) => {
  // Format the email body with the form data
  const subject = encodeURIComponent(`Training Registration: ${data.eventTitle || 'Upcoming Training'}`);
  
  let body = encodeURIComponent(
    `Registration Details:\n\n` +
    `Name: ${data.name}\n` +
    `Gender: ${data.gender}\n` +
    `Email: ${data.email}\n` +
    `Phone: ${data.phone}\n` +
    `Country: ${data.country}\n` +
    `State: ${data.state}\n` +
    `Local Government: ${data.localGovernment}\n` +
    `Address: ${data.address}\n` +
    `Needs Reminder Call: ${data.needReminder ? 'Yes' : 'No'}\n` +
    `Is PBO: ${data.isPBO}\n` +
    `Event: ${data.eventTitle || "Not specified"}\n` +
    `Event Date: ${data.eventDate || "Not specified"}\n`
  );
  
  if (data.inviteAnother && data.inviteeName && data.inviteePhone) {
    body += encodeURIComponent(
      `\nInvited Person:\n` +
      `Name: ${data.inviteeName}\n` +
      `Phone: ${data.inviteePhone}\n`
    );
  }
  
  // Open the default email client with pre-populated fields
  window.location.href = `mailto:training@pwanbridgefort.ng?subject=${subject}&body=${body}`;
};
