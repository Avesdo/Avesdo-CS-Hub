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
    
    // Send the email with HTML body and plaintext fallback
    MailApp.sendEmail({
      to: emailTo,
      subject: subject,
      body: data.body || "Please view this email in an HTML-compatible email client.",
      htmlBody: htmlContent
    });
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "emailTo": emailTo }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function checkUnsentEmails() {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('FIREBASE_API_KEY');
  var email = props.getProperty('FIREBASE_ADMIN_EMAIL');
  var password = props.getProperty('FIREBASE_ADMIN_PASSWORD');
  var projectId = props.getProperty('FIREBASE_PROJECT_ID');
  
  if (!apiKey || !email || !password || !projectId) {
    console.error("Missing Firebase configuration in Script Properties.");
    return;
  }
  
  // 1. Authenticate with Identity Toolkit
  var authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + apiKey;
  var authOptions = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ email: email, password: password, returnSecureToken: true }),
    muteHttpExceptions: true
  };
  
  var authRes = UrlFetchApp.fetch(authUrl, authOptions);
  if (authRes.getResponseCode() !== 200) {
    console.error("Firebase Authentication failed: " + authRes.getContentText());
    return;
  }
  
  var idToken = JSON.parse(authRes.getContentText()).idToken;
  
  // 2. Query Firestore for emailSent == false
  var firestoreUrl = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/(default)/documents:runQuery';
  var queryPayload = {
    structuredQuery: {
      from: [{ collectionId: 'notifications' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'emailSent' },
          op: 'EQUAL',
          value: { booleanValue: false }
        }
      }
    }
  };
  
  var queryOptions = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + idToken },
    payload: JSON.stringify(queryPayload),
    muteHttpExceptions: true
  };
  
  var queryRes = UrlFetchApp.fetch(firestoreUrl, queryOptions);
  if (queryRes.getResponseCode() !== 200) {
    console.error("Firestore query failed: " + queryRes.getContentText());
    return;
  }
  
  var results = JSON.parse(queryRes.getContentText());
  
  // 3. Process results
  for (var i = 0; i < results.length; i++) {
    var doc = results[i].document;
    if (!doc) continue; // Skip if no document (e.g., empty result)
    
    var fields = doc.fields;
    var formName = fields.formName ? fields.formName.stringValue : 'A form';
    var projectName = fields.projectName ? fields.projectName.stringValue : 'A Project';
    var projId = fields.projectId ? fields.projectId.stringValue : '';
    var type = fields.type ? fields.type.stringValue : 'submission';
    var actionStr = type === 'submission' ? 'submitted' : 'updated';
    var projectUrl = 'https://avesdo-cs-hub.web.app/?drawer=project&drawerId=' + projId;
    
    // Generate HTML Body
    var htmlContent = '<div style="background-color: #f8fafc; padding: 40px 20px; font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">' +
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
    
    // Send Email
    try {
      MailApp.sendEmail({
        to: 'support@avesdo.com',
        subject: '[CS Hub Alert] ' + formName + ' ' + actionStr + ' for "' + projectName + '"',
        body: 'Client for project "' + projectName + '" has ' + actionStr + ' their ' + formName + '. Please log into the CS Hub to review.\n\nView Project: ' + projectUrl,
        htmlBody: htmlContent
      });
      
      // Update Firestore emailSent: true
      var updateUrl = 'https://firestore.googleapis.com/v1/' + doc.name + '?updateMask.fieldPaths=emailSent';
      var updatePayload = { fields: { emailSent: { booleanValue: true } } };
      var updateOptions = {
        method: 'patch',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + idToken },
        payload: JSON.stringify(updatePayload),
        muteHttpExceptions: true
      };
      
      var patchRes = UrlFetchApp.fetch(updateUrl, updateOptions);
      if (patchRes.getResponseCode() !== 200) {
        console.error('Failed to update doc: ' + patchRes.getContentText());
      } else {
        console.log('Sent email and updated document: ' + doc.name);
      }
    } catch (e) {
      console.error('Failed to send email for doc: ' + doc.name + ' - Error: ' + e.toString());
    }
  }
  
  // 4. Check Scheduled Quizzes
  checkScheduledQuizzes(idToken, projectId);
}

function checkScheduledQuizzes(idToken, projectId) {
  var firestoreUrl = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/(default)/documents:runQuery';
  var queryPayload = {
    structuredQuery: {
      from: [{ collectionId: 'quizzes' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'scheduled' }
        }
      }
    }
  };
  
  var queryOptions = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + idToken },
    payload: JSON.stringify(queryPayload),
    muteHttpExceptions: true
  };
  
  var queryRes = UrlFetchApp.fetch(firestoreUrl, queryOptions);
  if (queryRes.getResponseCode() !== 200) {
    console.error("Firestore quizzes query failed: " + queryRes.getContentText());
    return;
  }
  
  var results = JSON.parse(queryRes.getContentText());
  
  var today = new Date();
  var todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  for (var i = 0; i < results.length; i++) {
    var doc = results[i].document;
    if (!doc) continue;
    
    var fields = doc.fields;
    var targetYear = fields.targetYear ? parseInt(fields.targetYear.integerValue) : today.getFullYear();
    var targetMonth = fields.targetMonth ? parseInt(fields.targetMonth.integerValue) : today.getMonth() + 1;
    
    var targetDateObj = new Date(targetYear, targetMonth - 1, 1).getTime();
    
    var shouldPublish = false;
    if (todayMonthStart > targetDateObj) {
      shouldPublish = true;
    } else if (todayMonthStart === targetDateObj) {
      var firstMondayDate = 1;
      var d = new Date(targetYear, targetMonth - 1, firstMondayDate);
      while (d.getDay() !== 1) {
        firstMondayDate++;
        d.setDate(firstMondayDate);
      }
      if (today.getDate() >= firstMondayDate) {
        shouldPublish = true;
      }
    }
    
    if (shouldPublish) {
      var enrolledIds = [];
      if (fields.enrolledUserIds && fields.enrolledUserIds.arrayValue && fields.enrolledUserIds.arrayValue.values) {
        var vals = fields.enrolledUserIds.arrayValue.values;
        for (var j = 0; j < vals.length; j++) {
          enrolledIds.push(vals[j].stringValue);
        }
      }
      
      var enrolledEmails = [];
      for (var k = 0; k < enrolledIds.length; k++) {
        var userUrl = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/(default)/documents/users/' + enrolledIds[k];
        var userRes = UrlFetchApp.fetch(userUrl, {
          method: 'get',
          headers: { Authorization: 'Bearer ' + idToken },
          muteHttpExceptions: true
        });
        if (userRes.getResponseCode() === 200) {
          var userDoc = JSON.parse(userRes.getContentText());
          if (userDoc.fields && userDoc.fields.email && userDoc.fields.email.stringValue) {
            enrolledEmails.push(userDoc.fields.email.stringValue);
          }
        }
      }
      
      var emailTo = enrolledEmails.length > 0 ? enrolledEmails.join(',') : 'support@avesdo.com';
      var monthName = monthNames[targetMonth - 1] || '';
      var quizMonthYear = monthName + ' ' + targetYear;
      var appUrl = 'https://avesdo-cs-hub.web.app';
      
      var htmlContent = '<div style="background-color: #f8fafc; padding: 40px 20px; font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">' +
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
      
      try {
        MailApp.sendEmail({
          to: emailTo,
          subject: '[Avesdo Academy] Your Knowledge Check is Ready',
          body: 'Hello team,\n\nYour ' + quizMonthYear + ' Knowledge Check is ready.\nPlease sign in at ' + appUrl,
          htmlBody: htmlContent
        });
        
        // Update Firestore status: 'published'
        var updateUrl = 'https://firestore.googleapis.com/v1/' + doc.name + '?updateMask.fieldPaths=status';
        var updatePayload = { fields: { status: { stringValue: 'published' } } };
        var updateOptions = {
          method: 'patch',
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + idToken },
          payload: JSON.stringify(updatePayload),
          muteHttpExceptions: true
        };
        var patchRes = UrlFetchApp.fetch(updateUrl, updateOptions);
        if (patchRes.getResponseCode() !== 200) {
          console.error('Failed to update quiz status: ' + patchRes.getContentText());
        } else {
          console.log('Published quiz and sent emails: ' + doc.name);
        }
      } catch (e) {
        console.error('Failed to send quiz email for doc: ' + doc.name + ' - Error: ' + e.toString());
      }
    }
  }
}