const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const http = require('http');
const https = require('https');
const url = require('url');
const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require("nodemailer");
const FieldValue = require('firebase-admin').firestore.FieldValue;
const {onSchedule} = require("firebase-functions/v2/scheduler");
const { Storage } = require('@google-cloud/storage');
const { onObjectFinalized, onObjectDeleted } = require('firebase-functions/v2/storage');
const {onDocumentWritten} = require('firebase-functions/v2/firestore')
//site key: 6LdJ_r0nAAAAAKTDnNzHjdEe-QV4Cp05KPcGAQtC
//secretkey: 6LdJ_r0nAAAAAFkTWsuuqcXoa1QPJ9KR0Fg-7yNg
admin.initializeApp();
const oauth2Client = new google.auth.OAuth2(
  "240473695577-nh51lv5t4tda6n8nvirfmhir1agijhl3.apps.googleusercontent.com",
  "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",
  "https://us-central1-print-submit.cloudfunctions.net/api/oAuthCallback"
);
app.use(cors({origin: ["http://localhost:3000",'https://printsubmit-git-preview-adamgerhant.vercel.app', 'https://www.printsubmit.com']}));


exports.initializeAccountInformation = functions.auth.user().onCreate(async (user) => {
  console.log("on create user")
  console.log(user)

  try {
    const db = admin.firestore();
    await db.runTransaction(async (transaction) => {
      const isGuestAccount = !user.email //if user does not have email then it is a guest account
      const email = user.email||"Guest"
      const uid = user.uid
      const date = new Date();
      const accountInformationDocRef = db.doc("users/"+uid+"/data/accountInformation")
      const accountInformationDocSnap = await transaction.get(accountInformationDocRef);
      const emailCountDocRef = db.doc("users/"+uid+"/data/emailCount")
      const emailCountDocSnap = await transaction.get(emailCountDocRef);

      if (!accountInformationDocSnap.exists) {
        if(isGuestAccount){
          await transaction.set(accountInformationDocRef, {
            storageUsed:0,
            totalStorage:0,
            dailyMax:0,
            accountType:"Guest"
          })
        }
        else{
          await transaction.set(accountInformationDocRef, {
            storageUsed:0,
            totalStorage:1,
            dailyMax:5,
            accountType:"Free"
          })
        }

        transaction.set(db.doc("users/"+uid),{created:"true", email:email, date:date.toISOString()}, {merge: true})
      }
      
      if (!emailCountDocSnap.exists) {
        const countData ={
          dailyTotal:0,
          total:0,
          submitted:0,
          printing:0,
          finished:0,
          error:0,
        }
        await transaction.set(emailCountDocRef, countData)         
      }

      response.status(200).send()

    })
  } catch (err) {
    console.log("transaction error")
    console.log(err)
    response.status(400).send();
  }
});


app.post('/googleLogin', (request, response) => {
  console.log("running google login")
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    //'https://www.googleapis.com/auth/gmail.send',
    //'https://www.googleapis.com/auth/gmail.compose',
    'https://mail.google.com/'
  ];

  admin.auth().verifyIdToken(request.body.token)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      console.log("uid: "+uid)
      var db = admin.firestore();

      //db.doc("users/"+uid).set({"testData":"testData"})

      db.doc("users/"+uid+"/data/emailData").get().then(async docSnap =>{
        let emailData = docSnap.data()
        const refreshToken = emailData.refresh_token;
        console.log("refresh token: "+refreshToken)
        if(refreshToken){
          let postData = "token=" + refreshToken;
          // Options for POST request to Google's OAuth 2.0 server to revoke a token
          let postOptions = {
            host: 'oauth2.googleapis.com',
            port: '443',
            path: '/revoke',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(postData)
            }
          };
          emailData.email = ""
          emailData.refresh_token = ""
          const firestore = admin.firestore();
          await firestore.doc("users/"+uid+"/data/emailData").set(emailData);
          
          const postReq = https.request(postOptions, function (res) {
            res.setEncoding('utf8');
            res.on('data', d => {
              console.log('Response: ' + d);
            });
          });
    
          postReq.on('error', error => {
            console.log(error)
          });
    
          // Post the request with data
          postReq.write(postData);
          postReq.end();
        }

      const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        prompt: "consent",
        state: uid
      });

      response.set('Cache-Control', 'private, max-age=0, s-maxage=0');
      response.send({"url": authorizationUrl});
      })
    })
  .catch((error) => {
    // Handle error
  });
  
});

app.get('/oAuthCallback', async (req, response) => {
    console.log("running oauthcallback")
  
    let q = url.parse(req.url, true).query;
    console.log("oauth request URL: "+req.url);
    if (q.error) { // An error response e.g. error=access_denied
      console.log('Error:' + q.error);
    } else { // Get access and refresh tokens (if access_type is offline)
      
      let { tokens } = await oauth2Client.getToken(q.code);
      console.log("tokens: ")
      console.log(tokens)
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2',
      });
      const userID = q.state
      const { data } = await oauth2.userinfo.get();
      const { email } = data;
      const { refresh_token, id_token, access_token } = tokens;
      const res = await oauth2.tokeninfo({
        access_token: access_token,
        id_token: id_token,
      });
      console.log("token info: ")
      console.log(res.data);
      console.log(res.data.scope.includes("send"));
      if(res.data.scope.includes("https://mail.google.com")){//if(res.data.scope.includes("send")){ //https://mail.google.com/
        // Store the refresh token in the Firestore database.
        const firestore = admin.firestore();
        
        await firestore.doc("users/"+userID+"/data/emailData").set({ email, refresh_token }, { merge: true });
        
        var redirectUrl = new URL("http://www.printsubmit.com/authorizeEmail?email="+email+"&success=true");
        response.redirect(redirectUrl);
      }
      else{
        var redirectUrl = new URL("http://www.printsubmit.com/authorizeEmail?email="+email+"&success=false");
        response.redirect(redirectUrl);
      }
      
    }
});

app.post('/revoke',async (request, response) => {
  console.log("running revoke function")
  admin.auth().verifyIdToken(request.body.token)
    .then((decodedToken) => {
    const uid = decodedToken.uid;
    var db = admin.firestore();
    db.doc("users/"+uid+"/data/emailData").get().then(async docSnap =>{
      let emailData = docSnap.data()
      const refreshToken = emailData.refresh_token;
      console.log("refresh token: "+refreshToken)
      let postData = "token=" + refreshToken;
      // Options for POST request to Google's OAuth 2.0 server to revoke a token
      let postOptions = {
        host: 'oauth2.googleapis.com',
        port: '443',
        path: '/revoke',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      emailData.email = ""
      emailData.refresh_token = ""
      const firestore = admin.firestore();
      await firestore.doc("users/"+uid+"/data/emailData").set(emailData);
      
      const postReq = https.request(postOptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', d => {
          console.log('Response: ' + d);
        });
      });

      postReq.on('error', error => {
        console.log(error)
      });

      // Post the request with data
      postReq.write(postData);
      postReq.end();
    })
  })
  response.end()
});

const sendEmail = (uid, status, recipient, name, errorMessage, cancelID) =>{
  return new Promise((resolve, reject) => {

    if(!status||!recipient){
      console.log("incorrect body data")
      return resolve({responseStatus:400, "message": 'incorrect body data'});
    }
    else if(!["submitted", "printing", "finished", "error"].includes(status)){
      console.log("incorrect status")
      return resolve({responseStatus:400, "message": 'incorrect status'});
    }
    
    var db = admin.firestore();
    db.doc("users/"+uid+"/data/emailData").get().then(docSnap =>{
      let emailData = docSnap.data()
      if(emailData.toSend[status]){
        db.doc("users/"+uid+"/data/accountInformation").get().then((accountInformationDocSnap)=>{
          const dailyMax = accountInformationDocSnap.data().dailyMax
          db.doc("users/"+uid+"/data/emailCount").get().then((emailCountDocSnap)=>{
            console.log("got mailCount")
            if(emailCountDocSnap.exists){     
              if(emailCountDocSnap.data().dailyTotal>=dailyMax){
                console.log("maximum emails sent")
                return resolve({responseStatus:400, message: 'maximum daily emails have already been sent'});
              }
              let emailCountData = {...emailCountDocSnap.data()}    
            
              const refreshToken = emailData.refresh_token;
              const email = emailData.email
              oauth2Client.setCredentials({
                refresh_token: refreshToken,
              });
              oauth2Client.getAccessToken().then((accessToken)=>{
                const emailTransporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  port: 465,
                  secure: true,
                  auth: {
                    type: "OAuth2",
                    user: email,          
                    clientId: "240473695577-nh51lv5t4tda6n8nvirfmhir1agijhl3.apps.googleusercontent.com",
                    clientSecret: "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",
                    refreshToken: refreshToken,
                    accessToken: accessToken.token
                  },
                });     
                let text = emailData[status+"Email"].body
                for(var i=0; i<50&&text.indexOf("[name]")>=0; i++){
                  text = text.replace("[name]", name)
                }
                for(var i=0; i<50&&text.indexOf("[errorMessage]")>=0; i++){
                  text = text.replace("[errorMessage]", errorMessage)
                }
                for(var i=0; i<50&&text.indexOf("[cancelLink]")>=0; i++){
                  text = text.replace("[cancelLink]", "http://www.printsubmit.com/public/"+uid+"/"+cancelID)
                }
                const mailOptions = {
                  from: email,
                  to: recipient,
                  subject: emailData[status+"Email"].subject,
                  text: text,
                }                
                console.log("sending mail")
                emailTransporter.sendMail(mailOptions).then(()=>{
                  console.log("mail sent")
                  emailCountData.total++
                  emailCountData.dailyTotal++
                  emailCountData[status]++
                  db.doc("users/"+uid+"/data/emailCount").set({
                    ...emailCountData
                  }).then(()=>{
                    console.log("email sent")
                    return resolve({responseStatus:200, "message": "email sent"})
                  }).catch((err)=>{
                    console.log("error incrementing: "+err);
                    return resolve({responseStatus:400, "message": 'could not increment email counter'});
                  })
                }).catch((err)=>{
                  console.log("error sending email: "+err);
                  return resolve({responseStatus:400, "message": 'error sending email'});
                })
                
              }).catch((err)=>{
                console.log("could not generate access token: "+err)
                return resolve({responseStatus:400, "message": 'could not generate access token'});
              })
            } else {
              console.log("count doc does not exist.")
              return resolve({responseStatus:400, "message": 'count doc does not exist'});
            }
          }).catch((err)=>{
            console.log("error getting email count: "+err)
            return resolve({responseStatus:400, "message": 'error getting email count'});
          })  
        }).catch((err)=>{
          console.log("error getting account information: "+err)
          return resolve({responseStatus:400, "message": 'error getting account information'});
        })    
      }
      else{
        console.log("did not send "+status+" email")
        return resolve({responseStatus:200, "message": "email not sent"})
      }
    }).catch((err)=>{
      console.log("error getting email data: "+err);
      return resolve({responseStatus:400, "message": 'count doc does not exist'});
    })
    
  })
  //console.log("end of function")
  //return({responseStatus:200, "message": 'end of function'});

}
app.post('/sendEmail', async (request, response)=>{
  console.log("running send email")
  const token = request.body.token;
  const status = request.body.status;
  const recipient = request.body.recipient;
  const name = request.body.name;
  const errorMessage = request.body.errorMessage
  const cancelID = request.body.cancelID

  console.log("verifying token")
  admin.auth().verifyIdToken(token).then(async (decodedToken) => {
    const uid = decodedToken.uid;
    if(decodedToken.firebase.sign_in_provider=="anonymous"){
      console.log("anonymous user")
      response.status(400).send({message: 'emails cannot be sent from guest account'});
    }
    sendEmail(uid, status, recipient, name, errorMessage, cancelID).then(({responseStatus, message})=>{
      console.log("resonse status: "+responseStatus)
      response.status(responseStatus).send({message: message});
    })
    
  })
  
  
})
app.post('/sendContactEmail', async (request, response)=>{
  const recaptchaToken = request.body.token;
  console.log(recaptchaToken)
  if(!recaptchaToken){
    return response.status(400).send({message: "recaptcha required"})
  }
  const secretKey = '6LdJ_r0nAAAAAFkTWsuuqcXoa1QPJ9KR0Fg-7yNg'; // Replace with your actual reCAPTCHA secret key
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
  const verificationResponse = await fetch(verificationUrl, {
    method: 'POST'
  });
  const verificationData = await verificationResponse.json();
  console.log(verificationData)
  if(!verificationData.success){
    console.log("recaptcha verifation failed")
    return response.status(400).send({
      message: 'reCAPTCHA verification failed.'});
  }

  oauth2Client.setCredentials({
    refresh_token: "1//04p5PeAfXGKSmCgYIARAAGAQSNwF-L9Ir_v_wxhcHIPIqm0Z_vZB5285J5zaHjUUjgupO70tu5QyJQc3yK94JokpwxLou47tIRRI"
  });
  oauth2Client.getAccessToken().then((accessToken)=>{
    const emailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: "adamgerhant@gmail.com",          
        clientId: "240473695577-nh51lv5t4tda6n8nvirfmhir1agijhl3.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: "1//04p5PeAfXGKSmCgYIARAAGAQSNwF-L9Ir_v_wxhcHIPIqm0Z_vZB5285J5zaHjUUjgupO70tu5QyJQc3yK94JokpwxLou47tIRRI",
        accessToken: accessToken.token
      },
    });     
    
    const mailOptions = {
      from: "adamgerhant@gmail.com",
      to: "printsubmitcontact@gmail.com",
      subject: request.body.subject,
      text: "From: "+request.body.from+"\nName: "+request.body.name+"\n\n"+request.body.text,
    }                
    console.log("sending mail")
    emailTransporter.sendMail(mailOptions).then(()=>{
      response.status(200).send()
    }).catch(()=>{
      response.status(400).send()
    })
  })
})
app.post('/storageUsed', async(request,response)=>{
  token = request.body.token;
  admin.auth().verifyIdToken(token).then(async (decodedToken) => {
    const uid = decodedToken.uid;
    const filePath = "users/"+uid
    console.log(filePath)
    const storage = new Storage({
      projectId: "print-submit",
      keyFilename:"serviceAccountKey.json"
    });
    const bucketName = 'print-submit.appspot.com';
  // List files in the specified folder
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: filePath });
    console.log(files)
    let totalSize = 0;
    for(const file of files){
      const [metadata] = await file.getMetadata()
      totalSize+= parseInt(metadata.size, 10);
    }
    console.log("setting storage used to: "+totalSize)
    db = admin.firestore()
    const accountInformationDocRef = db.doc("users/"+uid+"/data/accountInformation")
    accountInformationDocRef.update({
      storageUsed:totalSize
    })
    response.status(200).send({})
  })
})
app.post('/uploadURL', async (request, response)=>{
    
  if(request.body.password){
    return response.status(200).send(); 
  }
  const clientIP = request.headers['x-forwarded-for'] || request.socket.remoteAddress || request.headers['fastly-client-ip'] || "none";
  const db = admin.firestore() 
  const IPDocRef = db.doc("users/"+request.body.id+"/data/submissionData/ipData/ipData")
  const submissionFormDocRef = db.doc("users/"+request.body.id+"/data/submissionForm")
  const accountInformationDocRef = db.doc("users/"+request.body.id+"/data/accountInformation")

  try{
    const [IPDocSnap, submisisonFormDocSnap, accountInformationDocSnap] = await db.getAll(IPDocRef, submissionFormDocRef, accountInformationDocRef)

    const blockedIPData = IPDocSnap.data()
    const submissionFormData = submisisonFormDocSnap.data()
    const accountInformation = accountInformationDocSnap.data()
    const maxSize = submissionFormData.maxUploadSize

    const recaptchaToken = request.body.recaptchaToken;
    console.log(recaptchaToken)
    if(submissionFormData.captchaEnabled&&!recaptchaToken){
      return response.status(400).send({
        message: 'Error uploading\nno reCAPTCHA token.'
      });
    }
    if(recaptchaToken&&accountInformation.accountType=="Premium"){
      const secretKey = '6LdJ_r0nAAAAAFkTWsuuqcXoa1QPJ9KR0Fg-7yNg'; // Replace with your actual reCAPTCHA secret key
      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
      const verificationResponse = await fetch(verificationUrl, {
        method: 'POST'
      });
      const verificationData = await verificationResponse.json();
      console.log(verificationData)
      if(!verificationData.success){
        console.log("recaptcha verifation failed")
        return response.status(400).send({
          message: 'Error uploading\nreCAPTCHA verification failed.'
        });
      }
    }
    else if(recaptchaToken){
      response.status(403).send({
        message: 'Error uploading\nThe owner of this form must have a Premium account to use reCAPTCHA'
      }); 
    }

    if(accountInformation.accountType=="Premium"&&blockedIPData.hasOwnProperty(clientIP.replace(/\./g, '%2E'))&&blockedIPData[clientIP.replace(/\./g, '%2E')].blocked){
      response.status(403).send({
        message: 'Error uploading\nThe owner of the form has blocked you from submitting'
      }); 
    }
    else if(request.body.fileSize>maxSize*1000*1000){
      response.status(403).send({
        message: 'Error uploading\nfile must be less than '+maxSize+" MB",
      });
    }
    else if(request.body.thumbnailSize>100000||request.body.inputDataSize>100000){ 
      response.status(500).send()
      db.doc("debugging/"+request.body.id).set({
        "error":"thumbnailSize or inputDataSize is over 100000",
        "sizes":[request.body.thumbnailSize, request.body.inputDataSize],
        "clientIP":clientIP
      })
    }
    else if(submissionFormData.closed){
      response.status(403).send({
        message: 'Submission form closed'
      });
    }
    else if(accountInformation.storageUsed + request.body.fileSize +
      request.body.thumbnailSize + request.body.inputDataSize>
      (accountInformation.totalStorage*1000*1000*1000)&&!submissionFormData.deleteOldFiles)
    {
      response.status(403).send({
        message: 'Error uploading\nThe owner of this form has reached their storage limit and no more files can be uploaded'
      });
    }
    else{
      const fileID = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12)).toString(36)
      // The ID of your GCS bucket
      const bucketName = 'gs://print-submit.appspot.com';

      // The full path of your file inside the GCS bucket, e.g. 'yourFile.jpg' or 'folder1/folder2/yourFile.jpg'
      const uploadFileName = "users/"+request.body.id+"/"+fileID+"/"+request.body.fileName;
      const thumbnailFileName = "users/"+request.body.id+"/"+fileID+"/thumbnail.png";
      const inputDataFileName = "users/"+request.body.id+"/"+fileID+"/inputData.json";
      const ipFileName = "users/"+request.body.id+"/"+fileID+"/ip.json"

      // Creates a client
      const storage = new Storage({
        projectId: "print-submit",
        keyFilename:"serviceAccountKey.json"
      });
      const bucket = storage.bucket(bucketName);
      let storageUsed = accountInformation.storageUsed
      while(storageUsed + request.body.fileSize +
        request.body.thumbnailSize + request.body.inputDataSize >=
        (accountInformation.totalStorage*1000*1000*1000)
      ) { 
        const [allFiles] = await bucket.getFiles({ prefix: "users/"+request.body.id});
        allFiles.sort((a, b) => a.metadata.updated - b.metadata.updated);
        if (allFiles.length > 0) {
          const fileToDelete = allFiles[0];
          const [metadata] = await fileToDelete.getMetadata();
          const fileSize = parseInt(metadata.size, 10); // Size is in string, converting to integer
          storageUsed-=fileSize
          await fileToDelete.delete();
        } else {
          return response.status(403).send({
            message: 'Error uploading\nThe owner of this form has reached their storage limit and no more files can be uploaded'
          })
        }
      }
      const file = bucket.file(ipFileName);
      
      const contents = {}
      if(accountInformation.accountType=="Premium"){
        contents.ip = clientIP
      }else{
        contents.ip = "unknown"
      }
      for(const question of submissionFormData.questions){
        if(question.variable=="email"){
          contents.emailID = question.questionID
        }
        if(question.variable=="name"){
          contents.nameID = question.questionID
        }
      }
    
      file.save(JSON.stringify(contents, null, 2), function(err) {
        if (!err) {
        }
        else{
          console.log("error creating ip file: "+err)
        }
      });
      

      const uploadOptions = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        contentType: 'application/octet-stream', 
        extensionHeaders: {
          'X-Upload-Content-Length': request.body.fileSize,
        },
      };
      const thumbnailOptions = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        contentType: 'image/png',
        extensionHeaders: {
          'X-Upload-Content-Length': request.body.thumbnailSize,
        },
      };
      const inputDataOptions = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        contentType: 'application/json',
        extensionHeaders: {
          'X-Upload-Content-Length': request.body.inputDataSize,
        },
      };
      // Get a v4 signed URL for uploading file
      const [uploadURL] = await storage
        .bucket(bucketName)
        .file(uploadFileName)
        .getSignedUrl(uploadOptions);
      const [thumbnailURL] = await storage
        .bucket(bucketName)
        .file(thumbnailFileName)
        .getSignedUrl(thumbnailOptions);
      const [inputDataURL] = await storage
        .bucket(bucketName)
        .file(inputDataFileName)
        .getSignedUrl(inputDataOptions);

      console.log("retunring urls")
      response.status(200).send({
        message: 'url generated successfully',
        fileID: fileID,
        uploadURL:uploadURL,
        thumbnailURL:thumbnailURL,
        inputDataURL:inputDataURL
      });
    }
  }catch(err){
    console.log('main function error')
    console.log(err)
    response.status(500).send()
  }
})
app.post('/cancelSubscription', async (request, response)=>{
  console.log("cancelling subscription")
  token = request.body.token;
  admin.auth().verifyIdToken(token).then(async (decodedToken) => {
    const uid = decodedToken.uid;
    db = admin.firestore()
    const subscriptionsRef = db.collection("users/"+uid+"/subscriptions")
    try{
      const snap = await subscriptionsRef.get();
      console.log("got subscriptions ref")
      const stripe = require('stripe')("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")
      snap.forEach(async doc => {
        const subscriptionID = doc.id
        await stripe.subscriptions.cancel(subscriptionID);    
        console.log("cancelled "+ subscriptionID) 
      })
      return response.status(200).send()
    } catch(err) {
      console.log(err)
      return response.status(400).send();
    }
  })
})

exports.api = functions.https.onRequest(app);

exports.emailCountReset = onSchedule("every day 8:00", async (event) => {
  console.log("resetting email counts")
  db = admin.firestore();
  db.collection('users').get().then((snapshot) => {
    snapshot.docs.map((doc) => {
      doc.ref.collection("data").doc("emailCount").update({'dailyTotal': 0});
      console.log("reset daily total")
    });
  });
});

exports.formSubmit = onObjectFinalized({cpu: 2}, async (event) => {
 
  const filePath = event.data.name
  const pathSegment = filePath.split('/');
  if (pathSegment.length >= 3) {
    const fileID = pathSegment[2];
    const userID = pathSegment[1];
    db = admin.firestore()
    const fileIDRef = db.doc("users/"+userID+"/data/submissionData/submittedFileIDs/"+fileID)
    try {
      const filesInFolder = await db.runTransaction(async (transaction) => {
        const fileIDDocSnap = await transaction.get(fileIDRef)
        if(fileIDDocSnap.exists){
          const currentFiles = fileIDDocSnap.data().filesInFolder
          console.log("transaction value: "+currentFiles)

          transaction.update(fileIDRef, {
            filesInFolder: currentFiles+1
          })
          return currentFiles+1;
        }else{
          console.log("setting files in folder")
          transaction.set(fileIDRef, {
            filesInFolder: 1
          })
          return 1;
        }
      })

      console.log("files in folder: "+filesInFolder);
      if(filesInFolder==4){
        
        const fileIDPath = pathSegment.slice(0, 3).join('/');
        const storage = new Storage({
          projectId: "print-submit",
          keyFilename:"serviceAccountKey.json"
        });
        const bucketName = 'print-submit.appspot.com';
        // List files in the specified folder
        const [files] = await storage.bucket(bucketName).getFiles({ prefix: fileIDPath });
        const ipFileName = fileIDPath+"/ip.json"
        const inputDataFileName = fileIDPath+"/inputData.json"
        const bucket = storage.bucket(bucketName);
        const ipFile = bucket.file(ipFileName);
        const inputDataFile = bucket.file(inputDataFileName);

        const ipFileFileContent = await ipFile.download();
        const inputDataFileContent = await inputDataFile.download();
        console.log("file content:"+ipFileFileContent)
        const ipData = JSON.parse(ipFileFileContent.toString());
        let inputData = JSON.parse(inputDataFileContent.toString());

        const fileName = fileIDPath+"/"+inputData.fileName;
        const thumbnailName = fileIDPath+"/thumbnail.png";

        const [fileMetadata] = await bucket.file(fileName).getMetadata();
        inputData.modelSize = parseInt(fileMetadata.size, 10);

        const [thumbnailMetadata] = await bucket.file(thumbnailName).getMetadata();
        inputData.thumbnailSize = thumbnailMetadata.size

        inputData.fileDeleted = false;
        
        let totalSize = 0;
        
        for (const file of files) {
          const [metadata] = await file.getMetadata();
          totalSize += parseInt(metadata.size, 10);
        }
        inputData.fileSize = totalSize;

        const newDate = new Date(inputData.date)

        inputData.fileID = fileID;
        inputData.date = newDate.toUTCString()
        inputData.ip = ipData.ip

        db = admin.firestore();

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let cancelID = '';
        for (let i = 0; i < 20; i++) {
          cancelID += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const fileIDRef = db.doc("users/"+userID+"/data/submissionData/submittedFileIDs/"+fileID)
        const cancelRequestsRef = db.doc("users/"+userID+"/data/submissionData/cancelRequests/"+cancelID)
        const submissionDataRef = db.doc("users/"+userID+"/data/submissionData")
        const ipRef = db.doc("users/"+userID+"/data/submissionData/ipData/ipData")
        const accountInformationDocRef = db.doc("users/"+userID+"/data/accountInformation")
        //const folderRef = db.doc(`users/${pathSegment[1]}/folderCounts/${pathSegment[2]}`);

        console.log("running transaction")
        try {
          await db.runTransaction(async (transaction) => {
            // const fileIDSnap = await transaction.get(fileIDRef);
            //if (!fileIDSnap.exists) {
              //const ipSnap = await transaction.get(ipRef)

              transaction.set(cancelRequestsRef, {
                cancelled: false,
                reason: "",
                date: newDate.getTime(),
                fileID: fileID,
                fileName: inputData.fileName,
              });
        
              inputData.cancelID = cancelID;
              console.log("inputData sent: ");
              console.log(inputData);
        
              transaction.update(submissionDataRef, {
                data: admin.firestore.FieldValue.arrayUnion({ inputData }),
              });
              console.log("setting file id ref to complete")
              transaction.set(fileIDRef, {
                transferred: "complete",
                cancelID: cancelID
              })
              transaction.update(accountInformationDocRef,{
                storageUsed: admin.firestore.FieldValue.increment(inputData.fileSize)
              })
              //await transaction.set(folderRef,{fileCount:4})  
              transaction.set(ipRef,{
                [ipData.ip.replace(/\./g, '%2E')]:{blocked:false}
              }, { merge: true })  
            //}
          });
          let name=""
          if(ipData.hasOwnProperty("nameID")){
            const nameID = ipData.nameID;
            if(inputData.hasOwnProperty(nameID)){
              name=inputData[nameID]
            }
          }
          if(ipData.hasOwnProperty("emailID")){
            const emailID = ipData.emailID;
            if(inputData.hasOwnProperty(emailID)){
              const emailInput = inputData[emailID]
              console.log("emailInput: "+emailInput)
              console.log("name: "+name)

              sendEmail(userID, "submitted", emailInput, name, "", cancelID);
            }
          }
        } catch (err) {
          console.error("Transaction failed:", err);
          try {
            await fileIDRef.set({
              transferred: "error",
              errorMessage: err.toString(),
            });
          } catch (setErr) {
            console.error("Failed to set fileIDRef:", setErr);
          }
        } 
      }
    } catch(err) {
      console.error("files in folder transaction error: ", err);
    }
  }
});

exports.stripeWebhook = functions.https.onRequest((req, res)=>{
  const payload = req.body;
  console.log(payload);
  res.status(200).send();
})

exports.premiumStatus = onDocumentWritten("users/{userID}/subscriptions/{subscriptionID}", event=>{
  const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }
    const data = snapshot.after.data();
    const status = data.status;
    console.log("status: "+status)
    const uid = event.params.userID;
    const db = admin.firestore();
    const accountInformationDocRef = db.doc("users/"+uid+"/data/accountInformation")
    if(status=="active"){
      console.log("geting account information")
      accountInformationDocRef.get().then((docSnap)=>{
        console.log("got account information")
        if(docSnap.exists){
          console.log("updating account information")
          accountInformationDocRef.update({accountType:"Premium", totalStorage:10, dailyMax:25})
        }
        else{
          console.log("setting account information")
          accountInformationDocRef.set({accountType:"Premium", totalStorage:10, dailyMax:25, storageUsed:0})
        }
      })
    }
    else{
      accountInformationDocRef.get().then((docSnap)=>{
        if(docSnap.exists){
          console.log("updating account information")
          accountInformationDocRef.update({accountType:"Free", totalStorage:1, dailyMax:5})
        }
        else{
          console.log("setting account information")
          accountInformationDocRef.set({accountType:"Free", totalStorage:1, dailyMax:5, storageUsed:0})
        }
      })
    }
})



/*
exports.fileDeleted = onObjectDeleted({cpu: 2}, async (event) => {
  console.log("file deleted: ")
  console.log(event)

  const fileSize = Number(event.data.size)
  const filePath = event.data.name

  const pathSegment = filePath.split('/');
  const userID = pathSegment[1];

  const db = admin.firestore()
  db.doc("users/"+userID+"/data/accountInformation").update({
      storageUsed: admin.firestore.FieldValue.increment(-fileSize)
  });
})
*/

