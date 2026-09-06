// Read/write synthetic emulator data only; reports observed behavior, not security approval.
const fs = require('node:fs');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
(async () => {
 const env = await initializeTestEnvironment({projectId:'demo-iep-direction', firestore:{host:'127.0.0.1',port:39188,rules:fs.readFileSync('firestore.rules','utf8')},storage:{host:'127.0.0.1',port:39299,rules:fs.readFileSync('storage.rules','utf8')}});
 const results=[];
 async function probe(name, expected, fn) { let actual; try { await fn(); actual='allowed'; } catch(e) { actual=e.code || e.message; } results.push({name,expected,actual}); }
 try {
 await env.withSecurityRulesDisabled(async c => {
  const db=c.firestore();
  await db.doc('users/parent-a').set({role:'parent'});
  await db.doc('users/parent-a/students/child-a').set({name:'Synthetic',enrollmentStatus:'inquiry'});
  await db.doc('attendance/record-a').set({parentId:'parent-a',studentId:'child-a',date:'2026-09-05',notes:'SYNTHETIC PRIVATE',parentVisibleNote:'Public'});
  await db.doc('progressReports/report-a').set({parentId:'parent-a',studentId:'child-a',weekNumber:1});
  await db.doc('enrollmentInquiries/inquiry-a').set({email:'synthetic@example.test',submittedAt:new Date()});
  await db.doc('notifications/n-a').set({parentId:'parent-a',studentId:'child-a',kind:'attendance-flag',flag:'injury',attendanceDocId:'record-a',createdAt:new Date(),parentVisibleNote:'Public',read:false});
  await db.doc('resources/r-a').set({visibility:'enrolled',downloadCount:0});
 });
 const p=env.authenticatedContext('parent-a'); const db=p.firestore(); const staff=env.authenticatedContext('staff',{admin:true});
 await probe('parent reads private attendance note','allowed',()=>db.doc('attendance/record-a').get().then(d=>{if(d.data().notes!=='SYNTHETIC PRIVATE')throw Error('unexpected');}));
 await probe('parent creates confirmed booking without reserving a slot','allowed',()=>db.doc('bookings/forged').set({parentId:'parent-a',parentEmail:'synthetic-other@example.test',status:'confirmed',slotId:'nonexistent',date:'2099-01-01',startTime:'10:00',endTime:'11:00'}));
 await probe('parent changes booking owner and recipient','allowed',()=>db.doc('bookings/forged').update({parentId:'parent-b',parentEmail:'synthetic-third@example.test'}));
 await probe('parent changes student enrollment state and identity fields','allowed',()=>db.doc('users/parent-a/students/child-a').update({enrollmentStatus:'enrolled',parentId:'parent-b',id:'child-b'}));
 await probe('parent changes notification content and adds arbitrary fields','allowed',()=>db.doc('notifications/n-a').update({parentVisibleNote:'Forged',studentName:'Forged',extra:'arbitrary',read:'not-a-boolean'}));
 await probe('parent reads enrollment-only resource without enrollment','allowed',()=>db.doc('resources/r-a').get());
 await probe('parent download-counter write','permission-denied',()=>db.doc('resources/r-a').update({downloadCount:1}));
 await probe('admin pipeline query has no matching rule','permission-denied',()=>staff.firestore().collection('enrollmentInquiries').orderBy('submittedAt','desc').get());
 await probe('parent attendance query without parentId filter','permission-denied',()=>db.collection('attendance').where('studentId','==','child-a').where('date','>=','2026-09-01').orderBy('date','asc').get());
 await probe('parent report query without parentId filter','permission-denied',()=>db.collection('progressReports').where('studentId','==','child-a').orderBy('weekNumber','desc').limit(1).get());
 await probe('profile IEP upload uses unmatched path','storage/unauthorized',()=>p.storage().ref('iep-documents/parent-a/synthetic.pdf').putString('SYNTHETIC PDF','raw',{contentType:'application/pdf'}));
 await probe('expected IEP upload path is allowed','allowed',()=>p.storage().ref('ieps/parent-a/synthetic.pdf').putString('SYNTHETIC PDF','raw',{contentType:'application/pdf'}));
 console.log(JSON.stringify(results,null,2));
 if(results.some(r=>r.actual!==r.expected)) process.exitCode=1;
 } finally { await env.cleanup(); }
})().catch(e=>{console.error(e);process.exitCode=1});
