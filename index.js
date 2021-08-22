const Promise = require('./promise');

// 1.基本 promise
// let promise = new Promise((resolve) => {
//   setTimeout(() => {
//     resolve(1);
//   }, 500);
// });
// promise.then(
//   (value) => {
//     console.log(value);
//   },
//   (e) => {
//     console.log('出错了', e);
//   }
// );

// 2. 嵌套 promise
// let promise = new Promise((resolve) => {
//   setTimeout(() => {
//     resolve(
//       new Promise((resolve) => {
//         resolve(
//           new Promise((resolve) => {
//             resolve(1);
//           })
//         );
//       })
//     );
//   }, 500);
// });
// promise.then(
//   (value) => {
//     console.log(value);
//   },
//   (e) => {
//     console.log('出错了', e);
//   }
// );

Promise.all([
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 1);
  }),
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, 1);
  }),
]).then((val) => {
  console.log(val);
});
