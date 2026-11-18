/* Daraja, reimagined · unsolicited concept on tedthie.cc
   Not affiliated with Safaricom. Every key, phone number, ID and payment here is invented, and
   nothing in this prototype calls Safaricom or any other API: every reply is scripted below.
   The result codes and payload shapes follow Daraja's public API docs (checked 18 Nov 2026),
   because handling them is the point of the concept. */
window.DARAJA = (function () {
  'use strict';

  var INBOX = 'https://inbox.example.com/kb-7f3a';
  var SHORTCODE = 'T-551100';
  var HOST = 'https://sandbox.safaricom.co.ke';

  /* Octicons (MIT, GitHub), 16px. Filled in from the Figma file's icon set. */
  var ICONS = {"home":["M6.906.664a1.749 1.749 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019A1.75 1.75 0 0 1 13.25 15h-3.5a.75.75 0 0 1-.75-.75V9H7v5.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 1 13.25V6.23c0-.531.242-1.034.657-1.366l5.25-4.2Zm1.25 1.171a.25.25 0 0 0-.312 0l-5.25 4.2a.25.25 0 0 0-.094.196v7.019c0 .138.112.25.25.25H5.5V8.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v5.25h2.75a.25.25 0 0 0 .25-.25V6.23a.25.25 0 0 0-.094-.195Z"],"key":["M10.5 0a5.499 5.499 0 1 1-1.288 10.848l-.932.932a.749.749 0 0 1-.53.22H7v.75a.749.749 0 0 1-.22.53l-.5.5a.749.749 0 0 1-.53.22H5v.75a.749.749 0 0 1-.22.53l-.5.5a.749.749 0 0 1-.53.22h-2A1.75 1.75 0 0 1 0 14.25v-2c0-.199.079-.389.22-.53l4.932-4.932A5.5 5.5 0 0 1 10.5 0Zm-4 5.5c-.001.431.069.86.205 1.269a.75.75 0 0 1-.181.768L1.5 12.56v1.69c0 .138.112.25.25.25h1.69l.06-.06v-1.19a.75.75 0 0 1 .75-.75h1.19l.06-.06v-1.19a.75.75 0 0 1 .75-.75h1.19l1.023-1.025a.75.75 0 0 1 .768-.18A4 4 0 1 0 6.5 5.5ZM11 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"],"zap":["M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.346 1.909 1.22 3.004l-7.34 7.142a1.249 1.249 0 0 1-.871.354h-.302a1.25 1.25 0 0 1-1.157-1.723L5.633 10.5H3.462c-1.57 0-2.346-1.909-1.22-3.004L9.503.429Zm1.047 1.074L3.286 8.571A.25.25 0 0 0 3.462 9H6.75a.75.75 0 0 1 .694 1.034l-1.713 4.188 6.982-6.793A.25.25 0 0 0 12.538 7H9.25a.75.75 0 0 1-.683-1.06l2.008-4.418.003-.006a.036.036 0 0 0-.004-.009l-.006-.006-.008-.001c-.003 0-.006.002-.009.004Z"],"arrow-down-left":["M11.78 4.22a.75.75 0 0 1 0 1.06l-5.26 5.26h4.2a.75.75 0 0 1 0 1.5H4.71a.75.75 0 0 1-.75-.75V5.28a.75.75 0 0 1 1.5 0v4.2l5.26-5.26a.75.75 0 0 1 1.06 0Z"],"arrow-up-right":["M4.53 4.75A.75.75 0 0 1 5.28 4h6.01a.75.75 0 0 1 .75.75v6.01a.75.75 0 0 1-1.5 0v-4.2l-5.26 5.261a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L9.48 5.5h-4.2a.75.75 0 0 1-.75-.75Z"],"inbox":["M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Zm10.09 7h-2.875l-1.275 1.7a.75.75 0 0 1-.6.3h-3.5a.75.75 0 0 1-.6-.3L4.375 9.5H1.5v3.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25Z"],"history":["m.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z"],"alert":["M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"],"lock":["M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 1 0-5 0v2Z"],"book":["M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"],"question":["M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.92 6.085h.001a.749.749 0 1 1-1.342-.67c.169-.339.436-.701.849-.977C6.845 4.16 7.369 4 8 4a2.756 2.756 0 0 1 1.637.525c.503.377.863.965.863 1.725 0 .448-.115.83-.329 1.15-.205.307-.47.513-.692.662-.109.072-.22.138-.313.195l-.006.004a6.24 6.24 0 0 0-.26.16.952.952 0 0 0-.276.245.75.75 0 0 1-1.248-.832c.184-.264.42-.489.692-.661.103-.067.207-.132.313-.195l.007-.004c.1-.061.182-.11.258-.161a.969.969 0 0 0 .277-.245C8.96 6.514 9 6.427 9 6.25a.612.612 0 0 0-.262-.525A1.27 1.27 0 0 0 8 5.5c-.369 0-.595.09-.74.187a1.01 1.01 0 0 0-.34.398ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"],"bell":["M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.519 1.519 0 0 1 13.482 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947Zm5-3.5A3.5 3.5 0 0 0 4.5 5v2.947c0 .346-.102.683-.294.97l-1.703 2.556a.017.017 0 0 0-.003.01l.001.006c0 .002.002.004.004.006l.006.004.007.001h10.964l.007-.001.006-.004.004-.006.001-.007a.017.017 0 0 0-.003-.01l-1.703-2.554a1.745 1.745 0 0 1-.294-.97V5A3.5 3.5 0 0 0 8 1.5Z"],"search":["M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"],"rocket":["M14.064 0h.186C15.216 0 16 .784 16 1.75v.186a8.752 8.752 0 0 1-2.564 6.186l-.458.459c-.314.314-.641.616-.979.904v3.207c0 .608-.315 1.172-.833 1.49l-2.774 1.707a.749.749 0 0 1-1.11-.418l-.954-3.102a1.214 1.214 0 0 1-.145-.125L3.754 9.816a1.218 1.218 0 0 1-.124-.145L.528 8.717a.749.749 0 0 1-.418-1.11l1.71-2.774A1.748 1.748 0 0 1 3.31 4h3.204c.288-.338.59-.665.904-.979l.459-.458A8.749 8.749 0 0 1 14.064 0ZM8.938 3.623h-.002l-.458.458c-.76.76-1.437 1.598-2.02 2.5l-1.5 2.317 2.143 2.143 2.317-1.5c.902-.583 1.74-1.26 2.499-2.02l.459-.458a7.25 7.25 0 0 0 2.123-5.127V1.75a.25.25 0 0 0-.25-.25h-.186a7.249 7.249 0 0 0-5.125 2.123ZM3.56 14.56c-.732.732-2.334 1.045-3.005 1.148a.234.234 0 0 1-.201-.064.234.234 0 0 1-.064-.201c.103-.671.416-2.273 1.15-3.003a1.502 1.502 0 1 1 2.12 2.12Zm6.94-3.935c-.088.06-.177.118-.266.175l-2.35 1.521.548 1.783 1.949-1.2a.25.25 0 0 0 .119-.213ZM3.678 8.116 5.2 5.766c.058-.09.117-.178.176-.266H3.309a.25.25 0 0 0-.213.119l-1.2 1.95ZM12 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"],"plus":["M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"],"chevron-down":["M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"],"copy":["M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z","M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"],"eye":["M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"],"sync":["M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"],"check-circle":["M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm1.5 0a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm10.28-1.72-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l1.47 1.47 3.97-3.97a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"],"x-circle":["M2.344 2.343h-.001a8 8 0 0 1 11.314 11.314A8.002 8.002 0 0 1 .234 10.089a8 8 0 0 1 2.11-7.746Zm1.06 10.253a6.5 6.5 0 1 0 9.108-9.275 6.5 6.5 0 0 0-9.108 9.275ZM6.03 4.97 8 6.94l1.97-1.97a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l1.97 1.97a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-1.97 1.97a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L6.94 8 4.97 6.03a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018Z"],"clock":["M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"],"terminal":["M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25ZM7.25 8a.749.749 0 0 1-.22.53l-2.25 2.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L5.44 8 3.72 6.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.25 2.25c.141.14.22.331.22.53Zm1.5 1.5h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5Z"],"code":["m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"],"link-external":["M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"],"gear":["M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z"],"sign-out":["M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.97-1.97H6.75a.75.75 0 0 1 0-1.5Z"],"beaker":["M5 5.782V2.5h-.25a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 0 1.5H11v3.282l3.666 5.76C15.619 13.04 14.543 15 12.767 15H3.233c-1.776 0-2.852-1.96-1.899-3.458Zm-2.4 6.565a.75.75 0 0 0 .633 1.153h9.534a.75.75 0 0 0 .633-1.153L12.225 10.5h-8.45ZM9.5 2.5h-3V6c0 .143-.04.283-.117.403L4.73 9h6.54L9.617 6.403A.746.746 0 0 1 9.5 6Z"],"device-mobile":["M3.75 0h8.5C13.216 0 14 .784 14 1.75v12.5A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25V1.75C2 .784 2.784 0 3.75 0ZM3.5 1.75v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"],"checklist":["M2.5 1.75v11.5c0 .138.112.25.25.25h3.17a.75.75 0 0 1 0 1.5H2.75A1.75 1.75 0 0 1 1 13.25V1.75C1 .784 1.784 0 2.75 0h8.5C12.216 0 13 .784 13 1.75v7.736a.75.75 0 0 1-1.5 0V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Zm13.274 9.537v-.001l-4.557 4.45a.75.75 0 0 1-1.055-.008l-1.943-1.95a.75.75 0 0 1 1.062-1.058l1.419 1.425 4.026-3.932a.75.75 0 1 1 1.048 1.074ZM4.75 4h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM4 7.75A.75.75 0 0 1 4.75 7h2a.75.75 0 0 1 0 1.5h-2A.75.75 0 0 1 4 7.75Z"],"list-unordered":["M5.75 2.5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5ZM2 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"],"repo":["M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"],"triangle-down":["m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"],"dot-fill":["M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"],"check":["M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"],"x":["M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"],"webhook":["M5.5 4.25a2.25 2.25 0 0 1 4.5 0 .75.75 0 0 0 1.5 0 3.75 3.75 0 1 0-6.14 2.889l-2.272 4.258a.75.75 0 0 0 1.324.706L7 7.25a.75.75 0 0 0-.309-1.015A2.25 2.25 0 0 1 5.5 4.25Z","M7.364 3.607a.75.75 0 0 1 1.03.257l2.608 4.349a3.75 3.75 0 1 1-.628 6.785.75.75 0 0 1 .752-1.299 2.25 2.25 0 1 0-.033-3.88.75.75 0 0 1-1.03-.256L7.107 4.636a.75.75 0 0 1 .257-1.03Z","M2.9 8.776A.75.75 0 0 1 2.625 9.8 2.25 2.25 0 1 0 6 11.75a.75.75 0 0 1 .75-.751h5.5a.75.75 0 0 1 0 1.5H7.425a3.751 3.751 0 1 1-5.55-3.998.75.75 0 0 1 1.024.274Z"],"globe":["M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8.75a9.64 9.64 0 0 0 1.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0 0 10.22 8.75Zm4.44-1.5a9.64 9.64 0 0 0-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 0 0-.857 1.215A9.64 9.64 0 0 0 5.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 0 0 4.666 5.5c-.123-.181-.24-.365-.352-.552-.715-1.192-1.437-2.874-1.581-4.948Zm-2.733-1.5h2.733c.144-2.074.866-3.756 1.58-4.948.12-.197.237-.381.353-.552a6.507 6.507 0 0 0-4.666 5.5Zm10.181 1.5c-.144 2.074-.866 3.756-1.58 4.948-.12.197-.237.381-.353.552a6.507 6.507 0 0 0 4.666-5.5Zm2.733-1.5a6.507 6.507 0 0 0-4.666-5.5c.123.181.24.365.353.552.714 1.192 1.436 2.874 1.58 4.948Z"],"shield-check":["m8.533.133 5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.697 1.697 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667l5.25-1.68a1.748 1.748 0 0 1 1.066 0Zm-.61 1.429.001.001-5.25 1.68a.251.251 0 0 0-.174.237V7c0 1.36.275 2.666 1.057 3.859.784 1.194 2.121 2.342 4.366 3.298a.196.196 0 0 0 .154 0c2.245-.957 3.582-2.103 4.366-3.297C13.225 9.666 13.5 8.358 13.5 7V3.48a.25.25 0 0 0-.174-.238l-5.25-1.68a.25.25 0 0 0-.153 0ZM11.28 6.28l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l.97.97 2.97-2.97a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"],"package":["m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.201.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.248.248 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z"],"pulse":["M6 2c.306 0 .582.187.696.471L10 10.731l1.304-3.26A.751.751 0 0 1 12 7h3.25a.75.75 0 0 1 0 1.5h-2.742l-1.812 4.528a.751.751 0 0 1-1.392 0L6 4.77 4.696 8.03A.75.75 0 0 1 4 8.5H.75a.75.75 0 0 1 0-1.5h2.742l1.812-4.529A.751.751 0 0 1 6 2Z"],"graph":["M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"]};

  var PHONES = [
    ['254700000001', 'Test phone 1'],
    ['254700000002', 'Test phone 2'],
    ['254700000003', 'Test phone 3']
  ];

  /* ---------- Outcomes: one list per API powers the Outcome menus and the Failures page ---------- */
  var STK = [
    { code: '0', name: 'Paid', tone: 'success', desc: 'The service request is processed successfully.',
      hint: 'Mark the booking paid',
      saw: 'A confirmation SMS with the receipt number.',
      todo: ['Check ResultCode first. It’s 0, so the money moved.', 'Read the receipt from CallbackMetadata → MpesaReceiptNumber.', 'Mark the booking paid, once. Store CheckoutRequestID so a repeat callback changes nothing.'] },
    { code: '1', name: 'Insufficient balance', tone: 'danger', desc: 'The balance is insufficient for the transaction.',
      hint: 'Ask them to top up',
      saw: 'An M-Pesa message saying they don’t have enough money.',
      todo: ['Keep the booking unpaid.', 'Tell the customer plainly and offer “Try again” once they’ve topped up.', 'Don’t read CallbackMetadata: failed results don’t have it.'] },
    { code: '1032', name: 'Cancelled by the customer', tone: 'danger', desc: 'Request cancelled by user',
      hint: 'Normal. Offer “Try again”',
      saw: 'They tapped Cancel on the prompt.',
      todo: ['Treat it as normal, not an error.', 'Keep the booking unpaid and offer “Try again”.', 'Don’t read CallbackMetadata: failed results don’t have it.'] },
    { code: '1037', name: 'No response in about 60 s', tone: 'danger', desc: 'DS timeout user cannot be reached',
      hint: 'The prompt expired',
      saw: 'The prompt closed by itself, or their phone was off or out of reach.',
      todo: ['Check ResultCode before you read CallbackMetadata. Failed results don’t have it, and code that assumes it crashes here.', 'Keep the booking unpaid and show “Try again”.', 'Don’t retry on your own in a loop. Let the customer start the next prompt.'] },
    { code: '2001', name: 'Wrong PIN', tone: 'danger', desc: 'The initiator information is invalid.',
      hint: 'Let them retry',
      saw: 'An M-Pesa message saying the PIN was wrong.',
      todo: ['In STK Push, 2001 means the customer’s PIN was wrong. In B2C the same number means something else.', 'Let them try again.', 'Don’t read CallbackMetadata: failed results don’t have it.'] }
  ];

  var C2B = [
    { code: '0', name: 'Accepted', tone: 'success', desc: 'Accepted', hint: 'Your server lets the payment through',
      saw: 'A confirmation SMS from M-Pesa.',
      todo: ['Answer validation with ResultCode "0" inside 8 seconds.', 'Book the payment when the confirmation arrives, not at validation.', 'Reply to the confirmation with JSON and a 200. An empty reply makes Daraja retry.'] },
    { code: 'C2B00011', name: 'Invalid phone number', tone: 'danger', desc: 'Rejected', hint: 'Your server rejected the phone',
      saw: 'The payment was declined. No money left their account.',
      todo: ['Only send this from your validation address.', 'No confirmation follows a rejection, so don’t wait for one.'] },
    { code: 'C2B00012', name: 'Invalid account number', tone: 'danger', desc: 'Rejected', hint: 'The booking code didn’t match',
      saw: 'The payment was declined. No money left their account.',
      todo: ['Look the booking code up before you answer, and reject with C2B00012 if it doesn’t exist.', 'No confirmation follows a rejection, so don’t wait for one.', 'Answer within 8 seconds, or Daraja falls back to your Completed or Cancelled choice.'] },
    { code: 'C2B00013', name: 'Invalid amount', tone: 'danger', desc: 'Rejected', hint: 'Amount didn’t match the booking',
      saw: 'The payment was declined. No money left their account.',
      todo: ['Compare TransAmount with what the booking owes.', 'Reject with C2B00013 when it doesn’t match.'] },
    { code: 'C2B00014', name: 'Invalid KYC', tone: 'danger', desc: 'Rejected', hint: 'Customer details failed your check',
      saw: 'The payment was declined. No money left their account.',
      todo: ['Use it only when your own rules about the customer fail.', 'Tell the customer how to pay another way.'] },
    { code: 'C2B00015', name: 'Invalid short code', tone: 'danger', desc: 'Rejected', hint: 'Paid to the wrong shortcode',
      saw: 'The payment was declined. No money left their account.',
      todo: ['Check BusinessShortCode against the shortcodes you own.'] },
    { code: 'C2B00016', name: 'Other error', tone: 'danger', desc: 'Rejected', hint: 'Your own reason',
      saw: 'The payment was declined. No money left their account.',
      todo: ['Log your own reason next to the TransID, since the customer only sees a decline.'] },
    { code: 'down', name: 'Validation address down', tone: 'attention', desc: '', hint: 'Daraja uses your fallback choice',
      saw: 'Depends on your choice when you registered: Completed takes the money, Cancelled declines it.',
      todo: ['Pick Completed if you’d rather take the money and sort it out later.', 'Pick Cancelled if a wrong booking code must never be paid.', 'Either way, alert yourself when validation stops answering.'] },
    { code: 'replay', name: 'Same confirmation twice', tone: 'attention', desc: 'Accepted', hint: 'Book it once',
      saw: 'One payment and one SMS. Only your server sees the repeat.',
      todo: ['Save TransID with a unique index so a repeat books once.', 'Still answer the repeat with ResultCode 0 and a 200, so Daraja stops sending it.'] }
  ];

  var B2C = [
    { code: '0', name: 'Paid out', tone: 'success', desc: 'The service request is processed successfully.', hint: 'Mark the refund done, only now',
      saw: 'An SMS saying they received the money.',
      todo: ['Mark the refund done only when this result arrives, not when the request is accepted.', 'Keep TransactionID as the receipt.'] },
    { code: '1', name: 'Not enough money in your float', tone: 'danger', desc: 'The balance is insufficient for the transaction.', hint: 'Top up the float, then retry',
      saw: 'Nothing. No money arrived.',
      todo: ['Keep the refund pending.', 'Top up the B2C utility account, then retry with a new OriginatorConversationID.'] },
    { code: '2001', name: 'Initiator information is invalid', tone: 'danger', desc: 'The initiator information is invalid.', hint: 'Rebuild the credential',
      saw: 'Nothing. No money arrived.',
      todo: ['In B2C, 2001 means the initiator name, password or certificate is wrong. It isn’t a customer PIN.', 'In production, build the SecurityCredential with production.cer. The sandbox certificate fails every time.'] },
    { code: '2040', name: 'Customer isn’t registered on M-Pesa', tone: 'danger', desc: 'Credit Party customer type (Unregistered or Registered Customer) can’t be supported by the service.', hint: 'B2C can’t pay this number',
      saw: 'Nothing. No money arrived.',
      todo: ['Refund another way, or ask for a registered number.'] },
    { code: '8006', name: 'Security credential is locked', tone: 'danger', desc: 'The security credential is locked.', hint: 'The admin unlocks it',
      saw: 'Nothing. No money arrived.',
      todo: ['Only the Business Administrator can unlock it. Ask the business owner.'] },
    { code: 'timeout', name: 'Queue timeout', tone: 'attention', desc: '', hint: 'Check status before retrying',
      saw: 'Nothing. No money arrived.',
      todo: ['The notice goes to your QueueTimeOutURL, not your ResultURL.', 'Check the transaction status before you retry, so you never pay twice.'] },
    { code: 'duplicate', name: 'Duplicate request ID', tone: 'danger', desc: 'Duplicate OriginatorConversationID', hint: 'Use a fresh OriginatorConversationID',
      saw: 'Nothing. The request was refused before it ran.',
      todo: ['This is a request error (500.002.1001), not a result. No callback follows.', 'Make a new OriginatorConversationID for every payout attempt.'] }
  ];

  var SNIPPETS = {
    stk: 'const cb = req.body.Body.stkCallback;\n\nif (cb.ResultCode !== 0) {\n  // Failed results have no CallbackMetadata.\n  await bookings.markUnpaid(cb.CheckoutRequestID);\n  return res.sendStatus(200);\n}\n\nconst items = cb.CallbackMetadata.Item;\nconst receipt = items.find(i => i.Name === "MpesaReceiptNumber").Value;\nawait bookings.markPaid(cb.CheckoutRequestID, receipt);\nres.sendStatus(200);',
    c2b: 'app.post("/c2b/validate", async (req, res) => {\n  const booking = await bookings.find(req.body.BillRefNumber);\n  if (!booking) return res.json({ ResultCode: "C2B00012", ResultDesc: "Rejected" });\n  res.json({ ResultCode: "0", ResultDesc: "Accepted" });\n});\n\napp.post("/c2b/confirm", async (req, res) => {\n  // Unique index on TransID: a repeat books once.\n  await payments.insertOnce(req.body.TransID, req.body);\n  res.json({ ResultCode: 0, ResultDesc: "Accepted" });\n});',
    b2c: 'const r = req.body.Result;\n\nif (r.ResultCode !== 0) {\n  await refunds.markFailed(r.OriginatorConversationID, r.ResultCode);\n  return res.sendStatus(200);\n}\n\nawait refunds.markDone(r.OriginatorConversationID, r.TransactionID);\nres.sendStatus(200);'
  };

  /* ---------- IDs ---------- */
  var ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function rand(n) { var s = ''; for (var i = 0; i < n; i++) s += ABC[Math.floor(Math.random() * ABC.length)]; return s; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(d) { return '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()); }
  function short(d) { return pad(d.getDate()) + pad(d.getMonth() + 1) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()); }
  var ids = {
    merchant: function () { return 'DEMO-' + rand(4).toLowerCase() + '-' + rand(4).toLowerCase(); },
    checkout: function (d) { return 'ws_CO_DEMO_' + short(d); },
    receipt: function () { return 'DEMO' + rand(6); },
    conversation: function (d) { return 'AG_DEMO_' + short(d); },
    originator: function (d) { return 'DEMO-b2c-' + short(d); },
    request: function () { return 'DEMO-' + rand(8).toLowerCase(); }
  };

  /* ---------- Payloads ---------- */
  var stk = {
    request: function (f, d) {
      return { BusinessShortCode: SHORTCODE, Password: '<built for you>', Timestamp: stamp(d), TransactionType: 'CustomerPayBillOnline',
        Amount: Number(f.amount), PartyA: f.phone, PartyB: SHORTCODE, PhoneNumber: f.phone, CallBackURL: f.callback,
        AccountReference: f.ref, TransactionDesc: f.desc };
    },
    accepted: function (m, c) {
      return { MerchantRequestID: m, CheckoutRequestID: c, ResponseCode: '0', ResponseDescription: 'Success. Request accepted for processing', CustomerMessage: 'Success. Request accepted for processing' };
    },
    callback: function (o, m, c, f, receipt, d) {
      var cb = { MerchantRequestID: m, CheckoutRequestID: c, ResultCode: Number(o.code), ResultDesc: o.desc };
      if (o.code === '0') cb.CallbackMetadata = { Item: [
        { Name: 'Amount', Value: Number(f.amount) }, { Name: 'MpesaReceiptNumber', Value: receipt },
        { Name: 'TransactionDate', Value: Number(stamp(d)) }, { Name: 'PhoneNumber', Value: Number(f.phone) }] };
      return { Body: { stkCallback: cb } };
    }
  };
  var c2b = {
    register: function (f) { return { ShortCode: SHORTCODE, ResponseType: f.responseType, ConfirmationURL: f.confirm, ValidationURL: f.validate }; },
    registered: function () { return { OriginatorCoversationID: ids.request(), ResponseCode: '0', ResponseDescription: 'Success' }; },
    simulate: function (f) { return { ShortCode: SHORTCODE, CommandID: 'CustomerPayBillOnline', Amount: Number(f.amount), Msisdn: f.phone, BillRefNumber: f.account }; },
    simulated: function () { return { OriginatorCoversationID: ids.request(), ResponseCode: '0', ResponseDescription: 'Accept the service request successfully.' }; },
    notice: function (f, trans, d) {
      return { TransactionType: 'Pay Bill', TransID: trans, TransTime: stamp(d), TransAmount: Number(f.amount).toFixed(2), BusinessShortCode: SHORTCODE,
        BillRefNumber: f.account, MSISDN: f.phone.slice(0, 4) + '*****' + f.phone.slice(-3), FirstName: 'WANJIKU' };
    }
  };
  var b2c = {
    request: function (f, orig) {
      return { OriginatorConversationID: orig, InitiatorName: 'kata_test_initiator', SecurityCredential: '<built for you>', CommandID: f.cmd,
        Amount: Number(f.amount), PartyA: SHORTCODE, PartyB: f.phone, Remarks: f.remarks, QueueTimeOutURL: INBOX + '/b2c/timeout',
        ResultURL: INBOX + '/b2c/result', Occasion: f.occasion };
    },
    accepted: function (conv, orig) { return { ConversationID: conv, OriginatorConversationID: orig, ResponseCode: '0', ResponseDescription: 'Accept the service request successfully.' }; },
    duplicate: function () { return { requestId: ids.request(), errorCode: '500.002.1001', errorMessage: 'Duplicate OriginatorConversationID' }; },
    result: function (o, conv, orig, f, tx) {
      var r = { ResultType: 0, ResultCode: Number(o.code), ResultDesc: o.desc, OriginatorConversationID: orig, ConversationID: conv, TransactionID: tx };
      if (o.code === '0') r.ResultParameters = { ResultParameter: [{ Key: 'TransactionAmount', Value: Number(f.amount) }, { Key: 'TransactionReceipt', Value: tx }] };
      return { Result: r };
    }
  };

  /* ---------- Code samples (shown, never run) ---------- */
  var PATHS = { stk: '/mpesa/stkpush/v1/processrequest', register: '/mpesa/c2b/v2/registerurl', simulate: '/mpesa/c2b/v2/simulate', b2c: '/mpesa/b2c/v3/paymentrequest' };
  function indent(s, n) { var p = new Array(n + 1).join(' '); return s.split('\n').map(function (l, i) { return i ? p + l : l; }).join('\n'); }
  function pyJson(o) { return JSON.stringify(o, null, 4).replace(/: true/g, ': True').replace(/: false/g, ': False'); }
  function sample(kind, body, lang) {
    var url = HOST + PATHS[kind];
    if (lang === 'node') {
      return 'const res = await fetch("' + url + '", {\n  method: "POST",\n  headers: {\n    Authorization: `Bearer ${token}`,\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify(' + indent(JSON.stringify(body, null, 2), 2) + ')\n});\nconst reply = await res.json();';
    }
    if (lang === 'python') {
      return 'import requests\n\nreply = requests.post(\n    "' + url + '",\n    headers={"Authorization": f"Bearer {token}"},\n    json=' + indent(pyJson(body), 4) + ',\n).json()';
    }
    return 'curl -X POST ' + url + ' \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d \'' + indent(JSON.stringify(body, null, 2), 2) + '\'';
  }

  /* ---------- Earlier today: a believable history so every screen has something to show ---------- */
  function seed(now) {
    var at = function (min) { return new Date(now.getTime() - min * 60000); };
    var log = [], inbox = [];
    var STKF = { phone: '254700000001', amount: '500', ref: 'KB-2041', desc: 'Deposit', callback: 'https://api.kata.example.com/mpesa/stk' };

    // The "I paid, but it says unpaid" story: paid, but her own server answered 502.
    (function () {
      var d0 = at(62), d1 = at(61.7), m = 'DEMO-4b64-97ff', c = 'ws_CO_DEMO_' + short(d0), rc = 'DEMO7Q2K9X';
      var body = stk.callback(STK[0], m, c, STKF, rc, d1);
      var cbid = 'cb-seed-1';
      inbox.push({ id: cbid, api: 'stk', kind: 'STK result', tone: 'success', status: 'Paid', title: 'KES 500 · KB-2041', ref: 'KB-2041', idLabel: c, at: d1.getTime(), body: body, logId: 'l-seed-1', receipt: rc });
      log.push({ id: 'l-seed-1', api: 'stk', at: d0.getTime(), tone: 'success', status: 'Paid', amount: 500, phone: STKF.phone, idLabel: c, took: '19 s', ref: 'KB-2041',
        search: [c, m, rc, 'KB-2041'], request: stk.request(STKF, d0), response: stk.accepted(m, c), responseMeta: '200 · 0.4 s',
        steps: [['done', 'Sent', hm(d0)], ['done', 'Accepted', 'ResponseCode 0 · 0.4 s'], ['done', 'Paid', 'ResultCode 0 · ' + rc], ['failed', 'Delivered to your URL', '502 × 3']],
        callbacks: [{ title: 'Callback · from Daraja', meta: 'ResultCode 0 · ' + hm(d1), body: body, inboxId: cbid,
          deliveries: [{ ok: true, at: d1.getTime(), to: 'Test inbox', code: '200', ms: '0.1 s' },
            { ok: false, at: d1.getTime(), to: 'api.kata.example.com/mpesa/stk', code: '502', ms: '1.8 s' },
            { ok: false, at: d1.getTime() + 60000, to: 'api.kata.example.com/mpesa/stk', code: '502', ms: '1.7 s' },
            { ok: false, at: d1.getTime() + 120000, to: 'api.kata.example.com/mpesa/stk', code: '502', ms: '1.9 s' }] }],
        ownUrl: 'api.kata.example.com/mpesa/stk', undelivered: true });
    })();

    (function () {
      var d0 = at(58), d1 = at(57.7), m = 'DEMO-a91c-03de', c = 'ws_CO_DEMO_' + short(d0);
      var f = { phone: '254700000002', amount: '500', ref: 'KB-2042', desc: 'Deposit', callback: INBOX };
      var body = stk.callback(STK[2], m, c, f, '', d1);
      inbox.push({ id: 'cb-seed-2', api: 'stk', kind: 'STK result', tone: 'danger', status: 'Failed · 1032', title: 'KES 500 · KB-2042', ref: 'KB-2042', idLabel: c, at: d1.getTime(), body: body, logId: 'l-seed-2' });
      log.push({ id: 'l-seed-2', api: 'stk', at: d0.getTime(), tone: 'danger', status: 'Failed · 1032', amount: 500, phone: f.phone, idLabel: c, took: '19 s', ref: 'KB-2042',
        search: [c, m, 'KB-2042'], request: stk.request(f, d0), response: stk.accepted(m, c), responseMeta: '200 · 0.4 s',
        steps: [['done', 'Sent', hm(d0)], ['done', 'Accepted', 'ResponseCode 0'], ['done', 'Prompt on phone', 'Shown'], ['failed', 'Result', 'ResultCode 1032 · Cancelled']],
        callbacks: [{ title: 'Callback · from Daraja', meta: 'ResultCode 1032 · ' + hm(d1), body: body, inboxId: 'cb-seed-2', deliveries: [{ ok: true, at: d1.getTime(), to: 'Test inbox', code: '200', ms: '0.1 s' }] }] });
    })();

    (function () {
      var dr = at(52), d0 = at(51), d1 = at(50.98), d2 = at(50.96), t = 'DEMO8H3L1P';
      var f = { phone: '254700000003', amount: '800', account: 'KB-2042' };
      var reg = { responseType: 'Completed', confirm: INBOX + '/c2b/confirm', validate: INBOX + '/c2b/validate' };
      log.push({ id: 'l-seed-3', api: 'c2b', at: dr.getTime(), tone: 'default', status: 'URLs registered', amount: null, phone: null, idLabel: SHORTCODE, took: '0.6 s',
        search: [SHORTCODE], request: c2b.register(reg), response: c2b.registered(), responseMeta: '200 · 0.6 s', path: 'register',
        steps: [['done', 'Sent', hm(dr)], ['done', 'Registered', 'ResponseCode 0'], ['done', 'Validation', 'On · Completed if down'], ['done', 'Ready', 'Payments can arrive']], callbacks: [] });
      var vb = c2b.notice(f, t, d1), cb = c2b.notice(f, t, d2);
      inbox.push({ id: 'cb-seed-4', api: 'c2b', kind: 'C2B confirmation', tone: 'accent', status: 'Received', title: 'KES 800 · KB-2042', ref: 'KB-2042', idLabel: 'TransID ' + t, at: d2.getTime(), body: cb, logId: 'l-seed-4' });
      inbox.push({ id: 'cb-seed-5', api: 'c2b', kind: 'C2B validation', tone: 'default', status: 'You accepted', title: 'KES 800 · KB-2042', ref: 'KB-2042', idLabel: 'TransID ' + t, at: d1.getTime(), body: vb, logId: 'l-seed-4', reply: { ResultCode: '0', ResultDesc: 'Accepted' } });
      log.push({ id: 'l-seed-4', api: 'c2b', at: d0.getTime(), tone: 'accent', status: 'Received', amount: 800, phone: f.phone, idLabel: t, took: '2 s', ref: 'KB-2042',
        search: [t, 'KB-2042'], request: c2b.simulate(f), response: c2b.simulated(), responseMeta: '200 · 0.3 s', path: 'simulate',
        steps: [['done', 'Paid on phone', hm(d0)], ['done', 'Validation', 'You replied 0'], ['done', 'Completed', 'TransID ' + t], ['done', 'Confirmation', 'You replied 0 · 200']],
        callbacks: [{ title: 'Validation · from Daraja', meta: hm(d1), body: vb, inboxId: 'cb-seed-5', deliveries: [{ ok: true, at: d1.getTime(), to: 'Test inbox', code: '200', ms: '0.2 s' }] },
          { title: 'Confirmation · from Daraja', meta: hm(d2), body: cb, inboxId: 'cb-seed-4', deliveries: [{ ok: true, at: d2.getTime(), to: 'Test inbox', code: '200', ms: '0.1 s' }] }] });
    })();

    (function () {
      var d0 = at(34), d1 = at(33.7), conv = 'AG_DEMO_' + short(d0), orig = 'DEMO-b2c-' + short(d0), tx = 'DEMO9R4T2M';
      var f = { cmd: 'BusinessPayment', phone: '254700000001', amount: '500', remarks: 'Refund KB-2039', occasion: 'KB-2039' };
      var body = b2c.result(B2C[0], conv, orig, f, tx);
      inbox.push({ id: 'cb-seed-6', api: 'b2c', kind: 'B2C result', tone: 'success', status: 'Paid out', title: 'KES 500 · refund KB-2039', ref: 'KB-2039', idLabel: conv, at: d1.getTime(), body: body, logId: 'l-seed-6' });
      log.push({ id: 'l-seed-6', api: 'b2c', at: d0.getTime(), tone: 'success', status: 'Paid out', amount: 500, phone: f.phone, idLabel: conv, took: '17 s', ref: 'KB-2039',
        search: [conv, orig, tx, 'KB-2039'], request: b2c.request(f, orig), response: b2c.accepted(conv, orig), responseMeta: '200 · 0.5 s',
        steps: [['done', 'Sent', hm(d0)], ['done', 'Accepted', 'ResponseCode 0'], ['done', 'Processing', 'From float ' + SHORTCODE], ['done', 'Result', 'ResultCode 0 · Paid out']],
        callbacks: [{ title: 'Result · from Daraja', meta: 'ResultCode 0 · ' + hm(d1), body: body, inboxId: 'cb-seed-6', deliveries: [{ ok: true, at: d1.getTime(), to: 'Test inbox', code: '200', ms: '0.1 s' }] }] });
    })();

    (function () {
      var d0 = at(26), d1 = at(25.5), conv = 'AG_DEMO_' + short(d0), orig = 'DEMO-b2c-' + short(d0);
      var f = { cmd: 'BusinessPayment', phone: '254700000003', amount: '500', remarks: 'Refund KB-2037', occasion: 'KB-2037' };
      inbox.push({ id: 'cb-seed-7', api: 'b2c', kind: 'B2C timeout', tone: 'attention', status: 'Timed out', title: 'KES 500 · refund KB-2037', ref: 'KB-2037', idLabel: conv, at: d1.getTime(), body: null, logId: 'l-seed-7', timeout: true });
      log.push({ id: 'l-seed-7', api: 'b2c', at: d0.getTime(), tone: 'attention', status: 'Timed out', amount: 500, phone: f.phone, idLabel: conv, took: '30 s', ref: 'KB-2037',
        search: [conv, orig, 'KB-2037'], request: b2c.request(f, orig), response: b2c.accepted(conv, orig), responseMeta: '200 · 0.4 s',
        steps: [['done', 'Sent', hm(d0)], ['done', 'Accepted', 'ResponseCode 0'], ['failed', 'Processing', 'Not processed in time'], ['failed', 'Result', 'Queue timeout']],
        callbacks: [], timeoutAt: d1.getTime() });
    })();

    (function () {
      var d0 = at(14), orig = 'DEMO-b2c-' + short(at(34));
      var f = { cmd: 'BusinessPayment', phone: '254700000001', amount: '500', remarks: 'Refund KB-2039', occasion: 'KB-2039' };
      log.push({ id: 'l-seed-8', api: 'b2c', at: d0.getTime(), tone: 'danger', status: 'Rejected · duplicate', amount: 500, phone: f.phone, idLabel: orig, took: '0.2 s', ref: 'KB-2039',
        search: [orig, 'KB-2039', '500.002.1001'], request: b2c.request(f, orig), response: b2c.duplicate(), responseMeta: '500 · 0.2 s', responseError: true,
        steps: [['done', 'Sent', hm(d0)], ['failed', 'Refused', '500.002.1001 · duplicate ID'], ['waiting', 'Processing', 'Never started'], ['waiting', 'Result', 'No callback']], callbacks: [] });
    })();

    inbox.sort(function (a, b) { return b.at - a.at; });
    log.sort(function (a, b) { return b.at - a.at; });
    return { inbox: inbox, log: log };
  }
  function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }

  return {
    INBOX: INBOX, SHORTCODE: SHORTCODE, ICONS: ICONS, PHONES: PHONES,
    OUT: { stk: STK, c2b: C2B, b2c: B2C }, SNIPPETS: SNIPPETS,
    ids: ids, stamp: stamp, hm: hm, stk: stk, c2b: c2b, b2c: b2c, sample: sample, seed: seed
  };
})();
