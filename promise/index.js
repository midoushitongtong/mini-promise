const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

// 处理返回的新的 promise
const resolvePromise = (x, promise2, resolve, reject) => {
  // 不能自己返回自己
  if (promise2 === x) {
    return reject(new TypeError('不能自己返回自己'));
  }

  // 返回值也是 promise
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let called = false;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          // 递归 resolvePromise 直到返回值不是 promise
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(y, promise2, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        if (called) return;
        called = true;
        // 返回值是普通对象
        resolve(x);
      }
    } catch (e) {
      reject(e);
    }
  } else {
    resolve(x);
  }
};

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallback = [];
    this.onRejectedCallback = [];

    const resolve = (value) => {
      if (value instanceof Promise) {
        return value.then(resolve, reject); // 递归解析
      }

      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolvedCallback.forEach((fn) => fn());
      }
    };

    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallback.forEach((fn) => fn());
      }
    };

    executor(resolve, reject);
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (error) => {
            throw error;
          };

    const promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(x, promise2, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(x, promise2, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === PENDING) {
        // 这时候还没有调用 resolve 或 reject
        this.onResolvedCallback.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(x, promise2, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.onRejectedCallback.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(x, promise2, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value);
    });
  }

  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value);
    });
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      const arr = [];
      let index = 0;
      const processResult = (i, val) => {
        arr[i] = val;
        if (++index === promises.length) {
          resolve(arr);
        }
      };

      for (let i = 0; i < promises.length; i++) {
        let val = promises[i];
        if (typeof val.then === 'function') {
          val.then((val) => processResult(i, val), reject);
        } else {
          processResult(i, val);
        }
      }
    });
  }

  finally(cb) {
    return this.then(
      (y) => {
        return Promise.resolve(cb()).then(() => y);
      },
      (r) => {
        return Promise.resolve(cb()).then(() => {
          throw r;
        });
      }
    );
  }
}

// 实现一个promise的延迟对象 defer
Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = Promise;
