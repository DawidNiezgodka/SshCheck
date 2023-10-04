/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 713:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(147)
const { exec } = __nccwpck_require__(81)

const maxRetryTime = 600000
const intervalTime = 15000

const readHostsFromFile = filePath => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const ips = []

  lines.forEach(line => {
    const match = line.match(/ansible_host=([\d\.]+)/)
    if (match && match[1]) {
      ips.push(match[1])
    }
  })

  return ips
}

const checkSSHAvailability = (ip, callback) => {
  exec(`nc -z -v -w5 ${ip} 22`, error => {
    callback(!error)
  })
}

const waitForSSHAvailability = async ip => {
  return new Promise((resolve, reject) => {
    let elapsedTime = 0

    const interval = setInterval(() => {
      checkSSHAvailability(ip, isAvailable => {
        if (isAvailable) {
          clearInterval(interval)
          resolve(true)
        }
      })

      elapsedTime += intervalTime

      if (elapsedTime >= maxRetryTime) {
        clearInterval(interval)
        reject(new Error(`the host ${ip} is still unavailable.`))
      }
    }, intervalTime)
  })
}

const run = async () => {
  try {
    const ips = readHostsFromFile(process.env.INPUT_HOSTS_FILE)
    const promises = ips.map(ip => waitForSSHAvailability(ip))
    await Promise.all(promises)
    console.log('All hosts are reachable.')
    process.exit(0)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = {
  run
}


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/**
 * The entrypoint for the action.
 */
const { run } = __nccwpck_require__(713)

run()

})();

module.exports = __webpack_exports__;
/******/ })()
;