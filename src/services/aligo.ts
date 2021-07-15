// //@ts-nocheck
// import multiparty from 'multiparty';
// const formParse = (obj, auth, uri) => {
//   return new Promise((resolve, reject) => {
//     if (obj.headers['content-type'] && obj.headers['content-type'].indexOf('multipart/form-data') !== -1) {
//       // content-type이 multipart/form-data일때 multiparty form parse 사용
//       let form = new multiparty.Form();
//       form.parse(obj, function (err, fields, files) {
//         // postData 만들기
//         if (err) return reject(new Error(err));
//         let postData = {};
//         if (files.image) {
//           // 파일이 있을경우 파일스트림으로 첨부
//           postData.image = files.image;
//         }
//         if (files.fimage) {
//           // 대체문자(이미지) 첨부
//           postData.fimage = files.fimage;
//         }
//         for (let key in auth) {
//           // 인증정보
//           postData[key] = auth[key];
//         }
//         for (let key in fields) {
//           // 폼데이터
//           postData[`${key}`] = fields[key][0];
//         }
//         postData.uri = uri;
//         return resolve(postData);
//       });
//     } else {
//       // 그외 (application/json)
//       let postData = {};
//       for (let key in auth) {
//         // 인증정보
//         postData[key] = auth[key];
//       }
//       for (let key in obj.body) {
//         // json데이터
//         postData[key] = obj.body[key];
//       }
//       postData.uri = uri;
//       return resolve(postData);
//     }
//   });
// };

// const token = (obj, auth) => {
//   console.log('token init');
//   console.log(obj);
//   console.log(auth);
//   // 알림톡 토큰발행
//   if (!obj.body.type || !obj.body.time) {
//     return Promise.resolve({ code: 404, message: '토큰 유효기간은 필수입니다.' });
//   } else {
//     return formParse(obj, auth, `https://kakaoapi.aligo.in/akv10/token/create/${obj.body.time}/${obj.body.type}`).then(postRequest).catch(onError);
//   }
// };
// let form = new FormData();
// for (let key in data) {
//   if (key == 'image' || key == 'fimage') {
//     // 파일만 별도로 담아주기
//     if (data[key]) {
//       form.append(key, fs.createReadStream(data[key][0].path), { filename: data[key][0].originalFilename, contentType: data[key][0].headers['content-type'] });
//     }
//   } else {
//     form.append(key, data[key])
//   }
// }
// export { token };
