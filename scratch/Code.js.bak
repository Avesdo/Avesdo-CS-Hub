function doPost(e) {
  try {
    // Parse the JSON data sent from the CS Hub
    var data = JSON.parse(e.postData.contents);
    
    var htmlContent = '';
    var emailTo = '';
    var subject = '';

    if (data.action === 'send_invitation') {
      // Handle User Invitation
      var payload = data.payload || {};
      emailTo = payload.email || 'support@avesdo.com';
      var inviterEmail = payload.invitedBy || 'An Admin';
      var roleName = payload.roleId || 'User';
      subject = 'You have been invited to the Avesdo CS Hub';
      var appUrl = 'https://avesdo-cs-hub.web.app';

      htmlContent = '<div style="background-color: #f8fafa; padding: 40px 20px; font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #172122;">' +
        '<div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e1eaeb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">' +
          '<div style="background-color: #00bdd9; padding: 32px 24px; text-align: center;">' +
            '<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.025em;">Welcome to Avesdo CS Hub</h1>' +
          '</div>' +
          '<div style="padding: 40px 32px;">' +
            '<p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #172122;">Hello,</p>' +
            '<p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #172122;">You have been invited to the Avesdo CS Hub. Sign in below to get started.</p>' +
            '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px; margin-bottom: 32px;">' +
              '<tr><td align="center">' +
                '<a href="' + appUrl + '" style="display: inline-block; padding: 14px 28px; background-color: #00bdd9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 189, 217, 0.3);">Sign In to CS Hub</a>' +
              '</td></tr>' +
            '</table>' +
            '<p style="font-size: 14px; margin-bottom: 0; color: #172122;">Please sign in using your standard <strong>@avesdo.com</strong> Google Workspace account.</p>' +
          '</div>' +
          '<div style="background-color: #f8fafa; padding: 24px 32px; text-align: center; border-top: 1px solid #e1eaeb;">' +
            '<p style="margin: 0; font-size: 13px; color: #74868a; line-height: 1.5;">If you have any questions regarding your system permissions, please contact your administrator.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    } else if (data.action === 'assign_quiz') {
      var payload = data.payload || {};
      emailTo = payload.email || 'team@avesdo.com';
      subject = payload.subject || 'Your Knowledge Check is Ready';
      var quizMonthYear = payload.quizMonthYear || 'Knowledge Check';
      var appUrl = 'https://avesdo-cs-hub.web.app';

      htmlContent = '<div style="background-color: #f8fafc; padding: 40px 20px; font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">' +
        '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">' +
          '<div style="background-color: #00bdd9; padding: 32px 40px; text-align: left;">' +
            '<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Avesdo CS Hub</h1>' +
            '<p style="margin: 8px 0 0 0; color: #e0f8fb; font-size: 15px;">Academy</p>' +
          '</div>' +
          '<div style="padding: 40px;">' +
            '<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">Hello team,</p>' +
            '<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">Your ' + quizMonthYear + ' Knowledge Check is Ready.</h2>' +
            '<p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #475569;">Please log in and submit your answers by the end of the current week.</p>' +
            '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">' +
              '<tr><td align="left">' +
                '<a href="' + appUrl + '" style="display: inline-block; padding: 14px 28px; background-color: #00bdd9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px; box-shadow: 0 4px 14px 0 rgba(0, 189, 217, 0.25);">Sign in to Start Assessment</a>' +
              '</td></tr>' +
            '</table>' +
            '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />' +
            '<p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">This is an automated notification from the Avesdo CS Hub.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
      
    } else {
      // Handle Standard CS Hub Alert (fallback)
      emailTo = data.emailTo || 'support@avesdo.com'; 
      subject = data.subject || 'CS Hub Alert';
      var projectName = data.projectName || 'A Project';
      var formName = data.formName || 'A form';
      var actionStr = data.action || 'submitted';
      var projectUrl = data.projectUrl || 'https://avesdo-cs-hub.web.app';
      
      htmlContent = '<div style="background-color: #f8fafc; padding: 40px 20px; font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">' +
        '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">' +
          '<div style="background-color: #00bdd9; padding: 32px 40px; text-align: left;">' +
            '<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">CS Hub Alert</h1>' +
            '<p style="margin: 8px 0 0 0; color: #e0f8fb; font-size: 15px;">New client activity recorded</p>' +
          '</div>' +
          '<div style="padding: 40px;">' +
            '<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">' + formName + ' ' + actionStr.charAt(0).toUpperCase() + actionStr.slice(1) + '</h2>' +
            '<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">The <strong>' + formName + '</strong> for <strong>"' + projectName + '"</strong> has been successfully ' + actionStr + ' by the client.</p>' +
            '<p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #475569;">Please log into the CS Hub to review the submitted details and advance the project workflow.</p>' +
            '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">' +
              '<tr><td align="left">' +
                '<a href="' + projectUrl + '" style="display: inline-block; padding: 14px 28px; background-color: #00bdd9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px; box-shadow: 0 4px 14px 0 rgba(0, 189, 217, 0.25);">View Project in CS Hub</a>' +
              '</td></tr>' +
            '</table>' +
            '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />' +
            '<p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">This is an automated notification from the Avesdo CS Hub.<br/>Please do not reply directly to this email.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    
    // Send the email with HTML body
    MailApp.sendEmail({
      to: emailTo,
      subject: subject,
      htmlBody: htmlContent
    });
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "emailTo": emailTo }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}