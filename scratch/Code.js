function doPost(e) {
  try {
    // Parse the JSON data sent from the CS Hub
    var data = JSON.parse(e.postData.contents);
    
    // Fallback to support@avesdo.com if not provided
    var emailTo = data.emailTo || 'support@avesdo.com'; 
    var subject = data.subject || 'CS Hub Alert';
    var projectName = data.projectName || 'A Project';
    var formName = data.formName || 'A form';
    var action = data.action || 'submitted';
    var projectUrl = data.projectUrl || 'https://avesdo-cs-hub.web.app';
    
    // Construct the HTML body
    var htmlContent = '<div style="background-color: #f8fafc; padding: 40px 20px; font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">' +
      '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">' +
        '<div style="background-color: #00bdd9; padding: 32px 40px; text-align: left; font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">' +
          '<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">CS Hub Alert</h1>' +
          '<p style="margin: 8px 0 0 0; color: #e0f8fb; font-size: 15px; font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">New client activity recorded</p>' +
        '</div>' +
        '<div style="padding: 40px; font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">' +
          '<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a; font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">' + formName + ' ' + action.charAt(0).toUpperCase() + action.slice(1) + '</h2>' +
          '<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569; font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">The <strong style="color: #0f172a;">' + formName + '</strong> for <strong style="color: #0f172a;">"' + projectName + '"</strong> has been successfully ' + action + ' by the client.</p>' +
          '<p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #475569; font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">Please log into the CS Hub to review the submitted details and advance the project workflow.</p>' +
          '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">' +
            '<tr><td align="left">' +
              '<a href="' + projectUrl + '" style="display: inline-block; padding: 14px 28px; background-color: #00bdd9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px; box-shadow: 0 4px 14px 0 rgba(0, 189, 217, 0.25); font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">View Project in CS Hub</a>' +
            '</td></tr>' +
          '</table>' +
          '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />' +
          '<p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; font-family: \\\'Inter\\\', -apple-system, BlinkMacSystemFont, \\\'Segoe UI\\\', Roboto, Helvetica, Arial, sans-serif;">This is an automated notification from the Avesdo CS Hub.<br/>Please do not reply directly to this email.</p>' +
        '</div>' +
      '</div>' +
    '</div>';
    
    // Send the email with HTML body
    MailApp.sendEmail({
      to: emailTo,
      subject: subject,
      htmlBody: htmlContent
    });
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}