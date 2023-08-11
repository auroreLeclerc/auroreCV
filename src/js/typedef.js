/**
 * @typedef {Object} Cookie CookieStore: get() method
 * @property {string} name A string with the name of a cookie.
 * @property {string} value A string containing the value of the cookie.
 * @property {string} [domain] A string containing the domain of the cookie.
 * @property {string} [path] A string containing the path of the cookie.
 * @property {number | Date} [expires] A timestamp, given as Unix time in milliseconds, containing the expiration date of the cookie.
 * @property {boolean} [secure] A boolean value indicating whether the cookie is to be used in secure contexts only (true) or not (false).
 * @property {boolean} [partitioned] A boolean indicating whether the cookie is a partitioned cookie (true) or not (false). See Cookies Having Independent Partitioned State (CHIPS) for more information.
 * @property {"strict" | "lax" | "none"} [sameSite] Controls whether or not a cookie is sent with cross-site requests, providing some protection against cross-site request forgery attacks (CSRF).
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CookieStore}
 * @description The CookieStore interface of the 'Cookie Store API' provides methods for getting and setting cookies asynchronously from either a page or a service worker.
 * @typedef {Object} CookieStore
 * @property {CookieAddFunction} add
 * @property {CookieGetFunction} get
 * @property {CookieDeleteFunction} delete
 */

/**
 * A Promise that resolves with undefined when setting the cookie completes.
 * @typedef {function(string, string): Promise<void>} CookieAddFunction
 */

/**
 * A Promise that resolves with an object representing the first cookie matching the submitted name or options.
 * @typedef {function(string): Promise<Cookie>} CookieGetFunction
 */

/**
 * A Promise that resolves with undefined when deletion completes.
 * @typedef {function(string): Promise<void>} CookieDeleteFunction
 */