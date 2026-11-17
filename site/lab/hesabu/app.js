/* Hesabu · personal concept on tedthie.cc
   Every number on screen is worked out from the CBK Mobile Payments snapshot in data.js.
   The wording follows fixed rules (no live AI model), so the answers can be checked line by line. */
(function () {
  'use strict';

  var D = window.HESABU_DATA;
  var N = D.cols.value.length;
  var LAST = N - 1;
  var Y0 = D.start[0], M0 = D.start[1];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON = MONTHS.map(function (m) { return m.slice(0, 3); });
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Icons (Airtable icon set, exported from the Hesabu Figma file) ---------- */
  var ICONS = {
    plus: '0 0 14 14#E|M7.875 6.125V3.0625C7.875 2.821 7.679 2.625 7.4375 2.625H6.5625C6.321 2.625 6.125 2.821 6.125 3.0625V6.125H3.0625C2.821 6.125 2.625 6.321 2.625 6.5625V7.4375C2.625 7.679 2.821 7.875 3.0625 7.875H6.125V10.9375C6.125 11.179 6.321 11.375 6.5625 11.375H7.4375C7.679 11.375 7.875 11.179 7.875 10.9375V7.875H10.9375C11.179 7.875 11.375 7.679 11.375 7.4375V6.5625C11.375 6.321 11.179 6.125 10.9375 6.125H7.875Z',
    grid: '0 0 16 16#E|M0 1.994C0 .893.895 0 1.994 0H14.006C15.107 0 16 .895 16 1.994V14.006A1.996 1.996 0 0 1 14.006 16H1.994A1.996 1.996 0 0 1 0 14.006V1.994ZM2 7V8.002C2 8.557 2.452 9 3.01 9H4.99A1.006 1.006 0 0 0 6 8.001V6.999C6 6.443 5.548 6 4.99 6H3.01A1.006 1.006 0 0 0 2 6.999V7ZM7 7V8.002C7 8.557 7.449 9 8.003 9H12.997A1 1 0 0 0 14 8.001V6.999A1.003 1.003 0 0 0 12.997 6H8.003A1 1 0 0 0 7 6.999V7ZM2 3C2 3.556 2.452 4 3.01 4H4.99A1 1 0 0 0 4.99 2H3.01A1.006 1.006 0 0 0 2 3ZM7 3C7 3.556 7.449 4 8.003 4H12.997A1 1 0 0 0 14 3C14 2.444 13.551 2 12.997 2H8.003A1 1 0 0 0 7 3ZM2 11.999V13.001C2 13.557 2.452 14 3.01 14H4.99A1.006 1.006 0 0 0 6 13.001V11.999C6 11.443 5.548 11 4.99 11H3.01A1.006 1.006 0 0 0 2 11.999ZM7 11.999V13.001C7 13.557 7.449 14 8.003 14H12.997A1 1 0 0 0 14 13.001V11.999A1.003 1.003 0 0 0 12.997 11H8.003A1 1 0 0 0 7 11.999Z',
    chevronUp: '0 0 12 12#E|M3.601 8.098A.857.857 0 1 1 2.399 6.896L5.399 3.896A.851.851 0 0 1 6.601 3.896L9.601 6.896A.857.857 0 1 1 8.399 8.098L6 5.699 3.601 8.098Z',
    chevronDown: '0 0 12 12#E|M8.399 3.903A.857.857 0 1 1 9.601 5.105L6.601 8.105A.851.851 0 0 1 5.399 8.105L2.399 5.105A.857.857 0 1 1 3.601 3.903L6 6.302 8.399 3.903Z',
    chevronRight: '0 0 16 16#E|M5.148 4.525A1.028 1.028 0 0 1 6.618 3.055L10.829 7.266A1.04 1.04 0 0 1 10.829 8.736L6.619 12.946A1.028 1.028 0 0 1 5.149 11.476L8.624 8.001 5.148 4.525Z',
    infoS: '0 0 12 12#E|M6 4C5.448 4 5 3.552 5 3S5.448 2 6 2 7 2.448 7 3 6.552 4 6 4ZM7 9.125C7 9.608 6.608 10 6.125 10H5.875C5.392 10 5 9.608 5 9.125V5.875C5 5.392 5.392 5 5.875 5H6.125C6.608 5 7 5.392 7 5.875V9.125ZM6 0C2.686 0 0 2.686 0 6S2.686 12 6 12 12 9.314 12 6 9.314 0 6 0Z',
    info: '0 0 16 16#E|M8 5.667C7.356 5.667 6.833 5.145 6.833 4.5 6.833 3.856 7.356 3.334 8 3.334S9.167 3.856 9.167 4.5C9.167 5.145 8.644 5.667 8 5.667ZM9 12C9 12.553 8.552 13 8 13S7 12.553 7 12V8C7 7.448 7.448 7 8 7S9 7.448 9 8V12ZM8 1C4.134 1 1 4.134 1 8S4.134 15 8 15 15 11.866 15 8 11.866 1 8 1Z',
    history: '0 0 12 12#E|M2.964 4.997H3.92C4.195 4.997 4.285 5.184 4.132 5.414L2.688 7.58C2.529 7.818 2.285 7.81 2.132 7.58L.688 5.414C.53 5.177.63 4.997.9 4.997H1.495A5.004 5.004 0 1 1 3.514 10.087.75.75 0 0 1 4.335 8.919 3.57 3.57 0 1 0 2.965 4.997ZM7.16 3.997V5.687L7.94 6.467A.75.75 0 0 1 6.88 7.527L5.88 6.527A.75.75 0 0 1 5.66 5.997V3.997A.75.75 0 0 1 7.16 3.997Z',
    share: '0 0 14 14#E|M12.52 8.968C12.888 9.288 13.125 9.755 13.125 10.281 13.125 11.248 12.342 12.031 11.375 12.031S9.625 11.248 9.625 10.281 10.408 8.531 11.375 8.531C11.491 8.531 11.605 8.544 11.716 8.565 11.773 8.267 11.813 7.965 11.813 7.656 11.813 6.309 11.242 5.013 10.246 4.104A.438.438 0 0 1 10.837 3.458 4.919 4.919 0 0 1 12.688 7.656C12.688 8.103 12.621 8.54 12.52 8.968ZM11.375 11.156A.875.875 0 1 0 11.375 9.406.875.875 0 0 0 11.375 11.156ZM7 .656C7.967.656 8.75 1.439 8.75 2.406S7.967 4.156 7 4.156C6.29 4.156 5.682 3.732 5.408 3.125 4.067 3.598 2.965 4.646 2.468 6.033A.438.438 0 0 1 1.644 5.737C2.251 4.046 3.613 2.772 5.267 2.24 5.352 1.353 6.09.656 7 .656ZM7 3.281A.875.875 0 1 0 7 1.531.875.875 0 0 0 7 3.281ZM8.765 12.623A.438.438 0 0 1 8.453 13.157 6.075 6.075 0 0 1 7 13.344C5.58 13.344 4.261 12.822 3.239 11.915 3.048 11.987 2.842 12.031 2.625 12.031 1.658 12.031.875 11.248.875 10.281S1.658 8.531 2.625 8.531 4.375 9.314 4.375 10.281C4.375 10.704 4.219 11.087 3.969 11.389A5.153 5.153 0 0 0 7 12.469C7.418 12.469 7.832 12.415 8.23 12.31A.437.437 0 0 1 8.765 12.623ZM2.625 11.156A.875.875 0 1 0 2.625 9.406.875.875 0 0 0 2.625 11.156Z',
    up: '0 0 16 16#E|M8.59 2.324C8.264 1.876 7.737 1.874 7.41 2.324L4.59 6.201C4.264 6.649 4.444 7.013 5 7.013H6V12.007C6 13.115 6.887 14.013 8 14.013 9.104 14.013 10 13.126 10 12.007V7.013H11C11.552 7.013 11.737 6.652 11.41 6.201L8.59 2.324Z',
    chart: '0 0 12 12#E|M1.5 10V9A.5.5 0 0 1 2.5 9V10A.5.5 0 0 1 1.5 10ZM3.5 10V8A.5.5 0 0 1 4.5 8V10A.5.5 0 0 1 3.5 10ZM5.5 10V7A.5.5 0 0 1 6.5 7V10A.5.5 0 0 1 5.5 10ZM7.5 10V5A.5.5 0 0 1 8.5 5V10A.5.5 0 0 1 7.5 10ZM9.5 10V2A.5.5 0 0 1 10.5 2V10A.5.5 0 0 1 9.5 10Z',
    formula: '0 0 12 12#E|M9.547 8.464L10.977 9.894C11.172 10.089 11.172 10.407 10.977 10.601L10.792 10.786C10.598 10.981 10.28 10.981 10.085 10.786L8.655 9.356 7.225 10.786C7.03 10.981 6.712 10.981 6.518 10.786L6.333 10.601C6.139 10.407 6.139 10.089 6.333 9.894L7.763 8.464 6.333 7.034C6.139 6.839 6.139 6.521 6.333 6.327L6.518 6.142C6.712 5.948 7.03 5.948 7.225 6.142L8.655 7.572 10.085 6.142C10.28 5.948 10.598 5.948 10.792 6.142L10.977 6.327C11.172 6.521 11.172 6.839 10.977 7.034L9.547 8.464ZM6.123 1.996S5.291 1.877 5.092 3.09C5.039 3.412 4.99 3.708 4.943 3.996H5.623A.5.5 0 0 1 5.623 4.996H4.779C4.123 8.993 4.123 8.996 4.123 8.996S3.899 10.996 3.123 10.996C2.724 10.996 2.088 11.013.876 11.001L1.123 9.996S1.935 10.125 2.123 8.996C2.43 7.153 2.642 5.881 2.79 4.996H1.904A.5.5 0 0 1 1.904 3.996H2.956C3.122 3.003 3.123 2.996 3.123 2.996S3.331.954 5.123.996C5.247.999 6.467.995 6.467.995L6.123 1.996Z',
    bulb: '0 0 12 12#E|M3.355 5.226A4.017 4.017 0 0 1 3.127 4.671 3.004 3.004 0 0 1 3.004 3.818 2.996 2.996 0 1 1 8.449 5.544C8.046 6.309 7.511 7.333 7.511 8.055 6.648 8.29 4.807 8.718 4.807 8.718 4.67 8.75 4.559 8.666 4.559 8.527V8.055C4.559 7.182 3.765 6.015 3.355 5.226ZM4.544 9.511C4.541 9.378 4.64 9.245 4.777 9.211L7.569 8.506 7.562 9.025C7.56 9.157 7.458 9.29 7.322 9.325L4.788 9.97C4.658 10.003 4.55 9.911 4.548 9.789L4.544 9.511ZM4.521 10.713C4.519 10.581 4.618 10.448 4.755 10.413L7.547 9.708 7.539 10.227C7.538 10.36 7.436 10.493 7.3 10.527L4.766 11.172C4.635 11.205 4.528 11.113 4.526 10.992L4.521 10.713Z',
    bulbD: '0 0 16 16#E|M4.468 6.913A5.4 5.4 0 0 1 4.164 6.172 3.997 3.997 0 0 1 4 5.033 4 4 0 1 1 11.27 7.338C10.732 8.359 10.017 9.726 10.017 10.69 8.865 11.003 6.556 11.54 6.556 11.54 6.291 11.602 6.076 11.425 6.076 11.152V10.69C6.076 9.524 5.016 7.967 4.468 6.913ZM6.001 12.883C5.996 12.604 6.21 12.322 6.472 12.256L10.036 11.356 10.029 11.862C10.025 12.142 9.806 12.424 9.53 12.494L6.501 13.265C6.229 13.334 6.005 13.175 6.001 12.883ZM6 14.57C5.996 14.291 6.209 14.009 6.471 13.942L10.033 13.033 10.025 13.54C10.022 13.82 9.803 14.102 9.527 14.173L6.5 14.951C6.228 15.02 6.005 14.862 6 14.57Z',
    pie: '0 0 12 12#E|M6 12C2.686 12 0 9.314 0 6S2.686 0 6 0 12 2.686 12 6 9.314 12 6 12ZM2 3.5C2 3.776 2.231 4 2.5 4H9.5C9.776 4 10 3.768 10 3.5 10 3.224 9.769 3 9.5 3H2.5C2.224 3 2 3.232 2 3.5ZM3.5 6.5C3.5 6.768 3.723 7 3.998 7H8.002C8.285 7 8.5 6.776 8.5 6.5 8.5 6.232 8.277 6 8.002 6H3.998C3.715 6 3.5 6.224 3.5 6.5ZM4.5 9.5C4.5 9.768 4.722 10 4.995 10H7.005C7.284 10 7.5 9.776 7.5 9.5 7.5 9.232 7.278 9 7.005 9H4.995C4.716 9 4.5 9.224 4.5 9.5Z',
    check: '0 0 12 12#E|M4.288 8.341C4.681 8.729 5.323 8.722 5.714 8.333L8.992 5.08C9.386 4.688 9.393 4.056 8.999 3.663 8.609 3.272 7.988 3.271 7.594 3.68L5.352 6.005C5.157 6.207 4.851 6.208 4.66 5.999L4.383 5.696C4.01 5.287 3.393 5.27 2.999 5.663 2.609 6.054 2.613 6.687 3.004 7.072L4.288 8.341Z',
    source: '0 0 12 12#E|M5.353 5H.995C.446 5 0 4.557 0 3.991V2.009C0 1.452.456 1 .995 1H9.005C9.554 1 10 1.443 10 2.009V3.991C10 4.548 9.544 5 9.005 5H6.524L7.429 6.483 8.295 5.983C8.64 5.784 9.07 6.05 9.044 6.448L8.835 8.77C8.786 9.317 8.34 9.576 7.839 9.344L5.725 8.364C5.367 8.188 5.351 7.683 5.697 7.483L6.563 6.983 5.353 5ZM5.534 7L5.447 7.05C4.755 7.45 4.787 8.46 5.504 8.813L7.629 9.798C8.443 10.176 9.253 9.707 9.333 8.814L9.496 7H11.005C11.554 7 12 7.443 12 8.009V9.991C12 10.548 11.544 11 11.005 11H2.995C2.446 11 2 10.557 2 9.991V8.009C2 7.452 2.456 7 2.995 7H5.534Z',
    thumb: '0 0 16 16#E|M14.407 7.771C14.479 6.965 13.928 6.728 13.665 6.728H9.974L9.924 6.731C9.707 6.733 9.562 6.529 9.612 6.286 9.666 5.761 9.924 4.22 9.924 3.906 9.924 3.554 9.87 3.198 9.808 2.849 9.748 2.509 9.621 2.189 9.383 1.93 9.127 1.652 8.811 1.554 8.451 1.674 8.097 1.791 7.862 2.03 7.844 2.427 7.818 2.967 7.809 3.509 7.787 4.051A.505.505 0 0 1 7.732 4.264C7.199 5.222 6.632 6.038 6.108 7 5.985 7.227 5.847 7.288 5.581 7.35 5.331 7.38 4.568 7.623 4.568 7.623A.698.698 0 0 0 4.087 8.263V12.413C4.087 12.686 4.293 12.985 4.547 13.083 4.547 13.083 5.475 13.438 5.581 13.5 6.191 13.864 6.631 13.964 7.246 14.32A.398.398 0 0 0 7.432 14.375C8.937 14.378 10.217 14.375 11.722 14.375 11.94 14.375 12.656 14.28 12.839 13.5 13.024 12.715 12.274 12.473 12.274 12.473S13.203 12.586 13.356 11.719C13.5 10.905 12.794 10.661 12.763 10.649 13.05 10.599 13.703 10.46 13.84 9.856 13.98 9.24 13.55 8.846 13.318 8.688 13.668 8.68 14.345 8.464 14.407 7.771ZM1.587 12.996A.497.497 0 0 0 2.092 13.487H3.082A.5.5 0 0 0 3.587 12.997V7.977A.497.497 0 0 0 3.082 7.487H2.092A.5.5 0 0 0 1.587 7.977V12.996Z',
    thumbS: '0 0 12 12#E|M10.995 5.822C11.051 5.192 10.622 5.009 10.416 5.009H7.54L7.501 5.011C7.332 5.012 7.219 4.854 7.257 4.664 7.3 4.254 7.501 3.053 7.501 2.808 7.501 2.534 7.459 2.256 7.411 1.984A1.37 1.37 0 0 0 7.079 1.268C6.879 1.051 6.633.975 6.352 1.068 6.076 1.16 5.894 1.346 5.879 1.655 5.859 2.077 5.852 2.499 5.835 2.921A.37.37 0 0 1 5.792 3.087C5.376 3.834 4.935 4.47 4.526 5.221 4.43 5.398 4.322 5.445 4.115 5.494 3.92 5.517 3.485 5.666 3.485 5.666A.72.72 0 0 0 3 6.32V9.525C3 9.8 3.22 10.07 3.488 10.129 3.488 10.129 4.032 10.239 4.114 10.289 4.59 10.572 4.933 10.649 5.412 10.928A.31.31 0 0 0 5.557 10.97C6.73 10.973 7.728 10.97 8.902 10.97 9.072 10.97 9.63 10.897 9.772 10.288 9.917 9.676 9.332 9.488 9.332 9.488S10.056 9.575 10.176 8.899C10.288 8.265 9.738 8.075 9.713 8.065 9.937 8.027 10.446 7.918 10.553 7.447 10.663 6.967 10.327 6.659 10.146 6.537 10.42 6.53 10.946 6.362 10.995 5.822ZM1 9.777C1 10.054 1.217 10.278 1.493 10.278H2.066A.5.5 0 0 0 2.559 9.778V6.1C2.559 5.823 2.342 5.6 2.066 5.6H1.493A.5.5 0 0 0 1 6.1V9.777Z',
    flagS: '0 0 12 12#E|M3.5 2.761C3.5 2.487 3.703 2.175 3.954 2.076 3.954 2.076 5.3 1.402 6.5 1.786 7.7 2.171 9.035 1.572 9.035 1.572 9.292 1.478 9.5 1.623 9.5 1.907V6.374C9.5 6.653 9.282 6.944 9.025 7.01 9.025 7.01 7.7 7.459 6.5 7.17 5.3 6.882 3.5 7.648 3.5 7.648V2.761ZM2.5 2.01A.5.5 0 0 1 3.5 2.01V9.99A.5.5 0 0 1 2.5 9.99V2.01Z',
    flag: '0 0 16 16#E|M4.625 3.245C5.555 2.945 7.168 2.545 8.375 2.885 10.175 3.393 12.398 2.536 12.398 2.536 12.662 2.449 12.875 2.602 12.875 2.874V9.112C12.875 9.386 12.654 9.667 12.398 9.729 12.398 9.729 10.175 10.374 8.375 9.993 7.168 9.738 5.555 10.109 4.625 10.381V12.999A.506.506 0 0 1 4.117 13.5H3.633A.507.507 0 0 1 3.125 12.999V3A.507.507 0 0 1 3.633 2.5H4.117C4.397 2.5 4.625 2.73 4.625 3.001V3.245Z',
    search: '0 0 12 12#E|M2.5 5C2.5 3.619 3.619 2.5 5 2.5S7.5 3.619 7.5 5 6.381 7.5 5 7.5 2.5 6.381 2.5 5ZM10.854 9.439L8.433 7.019C8.785 6.424 9 5.74 9 5 9 2.794 7.206 1 5 1S1 2.794 1 5 2.794 9 5 9C5.739 9 6.424 8.785 7.019 8.433L9.439 10.854C9.635 11.049 9.951 11.049 10.146 10.854L10.854 10.146C11.049 9.951 11.049 9.635 10.854 9.439Z',
    warning: '0 0 12 12#E|M.46 10.348L5.076 1.503C5.588.522 6.414.525 6.924 1.503L11.539 10.348C11.793 10.836 11.551 11.232 10.997 11.232H1.002C.455 11.232.206 10.836.46 10.348ZM5 4.241V6.222C5 6.788 5.447 7.232 6 7.232 6.556 7.232 7 6.78 7 6.222V4.241C7 3.675 6.552 3.232 6 3.232 5.443 3.232 5 3.684 5 4.241ZM6 10.232A1 1 0 1 0 6 8.232 1 1 0 0 0 6 10.232Z',
    checklist: '0 0 16 16#E|M6.423 3.259C6.423 2.707 6.88 2.259 7.428 2.259H13.478A1 1 0 0 1 13.478 4.259H7.428A1.003 1.003 0 0 1 6.423 3.259ZM6.423 8.259C6.423 7.707 6.88 7.259 7.428 7.259H13.478A1 1 0 0 1 13.478 9.259H7.428A1.003 1.003 0 0 1 6.423 8.259ZM6.423 13.259C6.423 12.707 6.88 12.259 7.428 12.259H13.478A1 1 0 0 1 13.478 14.259H7.428A1.003 1.003 0 0 1 6.423 13.259ZM3.763 4.409A1.004 1.004 0 0 1 2.357 4.411L1.721 3.784A.661.661 0 0 1 1.718 2.837L1.738 2.817A.632.632 0 0 1 2.627 2.837L2.702 2.919A.497.497 0 0 0 3.431 2.929L4.806 1.503A.661.661 0 0 1 5.746 2.442L3.763 4.409ZM3.763 9.409A1.004 1.004 0 0 1 2.357 9.411L1.721 8.784A.661.661 0 0 1 1.718 7.837L1.738 7.817A.632.632 0 0 1 2.627 7.837L2.702 7.919A.497.497 0 0 0 3.431 7.929L4.806 6.503A.661.661 0 0 1 5.745 7.442L3.763 9.409ZM3.763 14.409A1.004 1.004 0 0 1 2.357 14.411L1.721 13.784A.661.661 0 0 1 1.718 12.837L1.738 12.817A.632.632 0 0 1 2.627 12.837L2.702 12.919A.497.497 0 0 0 3.431 12.929L4.806 11.503A.661.661 0 0 1 5.745 12.442L3.763 14.409Z'
  };
  function icon(name, cls) {
    var spec = ICONS[name]; if (!spec) return '';
    var parts = spec.split('#');
    var paths = parts[1].split('~').map(function (d) {
      var eo = d.indexOf('E|') === 0;
      return '<path ' + (eo ? 'fill-rule="evenodd" clip-rule="evenodd" ' : '') + 'd="' + (eo ? d.slice(2) : d) + '"/>';
    }).join('');
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="' + parts[0] + '" aria-hidden="true" focusable="false">' + paths + '</svg>';
  }
  var MARK = '<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><g fill="#FFFFFF"><circle cx="18.42" cy="7.8" r="2.38"/><circle cx="18.42" cy="13" r="2.38"/><circle cx="13.22" cy="13" r="2.38"/><circle cx="18.42" cy="18.2" r="2.38"/><circle cx="13.22" cy="18.2" r="2.38"/><circle cx="8.02" cy="18.2" r="2.38"/></g></svg>';
  var CARET = '<svg width="6" height="5" viewBox="0 0 6 5" aria-hidden="true"><path fill="#757575" d="M.601 0H5.401C5.895 0 6.177.564 5.881.96L3.481 4.16C3.241 4.48 2.761 4.48 2.521 4.16L.121.96C-.176.564.107 0 .601 0Z"/></svg>';

  /* Counting glyph: beads slide right one at a time, top row 1, middle 2, bottom 3. */
  function glyph(small) {
    if (small) {
      var s = '<svg class="glyph glyph--s" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="8" fill="#CFDFFF"/>';
      [8.5, 14, 19.5].forEach(function (y) { s += '<rect x="6" y="' + (y - .75) + '" width="16" height="1.5" rx=".75" fill="#9CC7FF"/>'; });
      [[20.5, 8.5, 1], [20.5, 14, 2], [14.5, 14, 3], [20.5, 19.5, 4], [14.5, 19.5, 5], [8.5, 19.5, 6]].forEach(function (b) {
        s += '<circle class="bead" data-n="' + b[2] + '" cx="' + b[0] + '" cy="' + b[1] + '" r="2.75" fill="#2D7FF9"/>';
      });
      return s + '</svg>';
    }
    var g = '<svg class="glyph" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><rect width="56" height="56" rx="16" fill="#CFDFFF"/>';
    [17, 28, 39].forEach(function (y) { g += '<rect x="9" y="' + (y - 1) + '" width="38" height="2" rx="1" fill="#9CC7FF"/>'; });
    // [cx, cy, order it moves in, or 0 if it stays]
    [[11, 17, 0], [21, 17, 0], [31, 17, 1], [11, 28, 0], [21, 28, 3], [31, 28, 2], [11, 39, 6], [21, 39, 5], [31, 39, 4]].forEach(function (b) {
      g += '<circle class="bead" data-n="' + b[2] + '" cx="' + b[0] + '" cy="' + b[1] + '" r="3.75" fill="#FFFFFF" stroke="#9CC7FF" stroke-width="1.5"/>';
    });
    return g + '</svg>';
  }
  // step 1 → bead 1; step 2 → beads 2, 3; step 3 → beads 4, 5, 6 (80ms stagger)
  var STEP_BEADS = [[], [1], [2, 3], [4, 5, 6]];
  function setGlyph(svg, step) {
    var beads = svg.querySelectorAll('.bead');
    var on = [].concat.apply([], STEP_BEADS.slice(0, step + 1));
    var fresh = STEP_BEADS[step] || [];
    beads.forEach(function (b) {
      var n = +b.getAttribute('data-n'); if (!n) return;
      var isOn = on.indexOf(n) > -1;
      b.style.transitionDelay = isOn && fresh.indexOf(n) > -1 ? (fresh.indexOf(n) * 80) + 'ms' : '0ms';
      if (!svg.classList.contains('glyph--s')) b.style.transform = isOn ? 'translateX(14px)' : '';
      b.classList.toggle('on', isOn);
    });
  }
  function playGlyph(svg, loop) {
    if (REDUCED) { setGlyph(svg, 3); return function () {}; }
    var step = 0, alive = true;
    setGlyph(svg, 0);
    (function tick() {
      if (!alive) return;
      step = step + 1;
      if (step > 3) { if (!loop) return; step = 0; }
      setGlyph(svg, step);
      setTimeout(tick, step === 0 ? 260 : 400);
    })();
    return function () { alive = false; };
  }

  /* ---------- Months and numbers ---------- */
  function ym(i) { var t = Y0 * 12 + (M0 - 1) + i; return [Math.floor(t / 12), t % 12 + 1]; }
  function at(y, m) { var i = y * 12 + (m - 1) - (Y0 * 12 + (M0 - 1)); return i >= 0 && i <= LAST ? i : -1; }
  function mLong(i) { var a = ym(i); return MONTHS[a[1] - 1] + ' ' + a[0]; }
  function mMid(i) { var a = ym(i); return MON[a[1] - 1] + ' ' + a[0]; }
  function mShort(i) { var a = ym(i); return MON[a[1] - 1] + ' ' + String(a[0]).slice(2); }
  function mName(i) { return MONTHS[ym(i)[1] - 1]; }
  function mIso(i) { var a = ym(i); return a[0] + '-' + (a[1] < 10 ? '0' : '') + a[1]; }
  function int(v) { return Math.round(v).toLocaleString('en-US'); }
  function pct(a, b) { return (b / a - 1) * 100; }
  function p1(v) { return Math.abs(v).toFixed(1) + '%'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- The four measures, plus two Hesabu works out ---------- */
  var M = {
    agents: { label: 'Active agents', side: 'Agents', lower: 'active agents', subj: 'Active agents', plural: true, col: 'Active Agents', sql: 'active_agents', unit: 'agents',
      get: function (i) { return D.cols.agents[i]; }, fmt: int, words: int, short: function (v) { return int(v); }, axis: function (v) { return v === 0 ? '0' : (v / 1000) + 'k'; } },
    accounts: { label: 'Registered accounts', side: 'Accounts', lower: 'registered accounts', subj: 'Registered accounts', plural: true, col: 'Total Registered Mobile Money Accounts (millions)', sql: 'accounts_m',
      get: function (i) { return D.cols.accounts[i]; }, fmt: function (v) { return v.toFixed(2) + 'M'; }, words: function (v) { return v.toFixed(2) + ' million'; }, short: function (v) { return v.toFixed(2) + 'M'; }, axis: function (v) { return v + 'M'; } },
    volume: { label: 'Cash in/out volume', side: 'Agent volume', lower: 'cash in/out volume', subj: 'Agent cash in/out volume', plural: false, many: true, col: 'Total Agent Cash in Cash Out (volume, millions)', sql: 'volume_m',
      get: function (i) { return D.cols.volume[i]; }, fmt: function (v) { return v.toFixed(2) + 'M'; }, words: function (v) { return v.toFixed(2) + ' million transactions'; }, short: function (v) { return v.toFixed(2) + 'M'; }, axis: function (v) { return v + 'M'; } },
    value: { label: 'Cash in/out value', side: 'Agent value', lower: 'cash in/out value', subj: 'Agent cash in/out value', plural: false, col: 'Total Agent Cash in Cash Out (value, KSh billions)', sql: 'value_kes_bn',
      get: function (i) { return D.cols.value[i]; }, fmt: function (v) { return 'KSh ' + v.toFixed(2) + 'bn'; }, words: function (v) { return 'KSh ' + v.toFixed(2) + ' billion'; }, short: function (v) { return v.toFixed(2) + 'bn'; }, axis: function (v) { return v + 'bn'; } },
    avg: { label: 'Average agent transaction', side: 'Average transaction', lower: 'the average agent transaction', subj: 'The average agent transaction', plural: false, derived: true, uses: ['value', 'volume'],
      get: function (i) { return D.cols.value[i] * 1000 / D.cols.volume[i]; }, fmt: function (v) { return 'KSh ' + int(v); }, words: function (v) { return 'KSh ' + int(v); }, short: function (v) { return 'KSh ' + int(v); }, axis: function (v) { return 'KSh ' + v; } },
    perAgent: { label: 'Value per agent', side: 'Value per agent', lower: 'value per agent', subj: 'Value per agent', plural: false, derived: true, uses: ['value', 'agents'],
      get: function (i) { return D.cols.value[i] * 1e9 / D.cols.agents[i]; }, fmt: function (v) { return 'KSh ' + (v / 1e6).toFixed(2) + 'M'; }, words: function (v) { return 'KSh ' + (v / 1e6).toFixed(2) + ' million'; }, short: function (v) { return 'KSh ' + (v / 1e6).toFixed(2) + 'M'; }, axis: function (v) { return 'KSh ' + (v / 1e6) + 'M'; } }
  };
  var BASE = ['agents', 'accounts', 'volume', 'value'];

  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  function series(key, a, b) { return range(a, b).map(function (i) { return M[key].get(i); }); }
  function peakIn(key, a, b) { var best = a; for (var i = a; i <= b; i++) if (M[key].get(i) > M[key].get(best)) best = i; return best; }
  function sqlRange(cols, a, b) {
    return 'SELECT month, ' + cols + '\nFROM cbk_mobile_payments\nWHERE month ' + (a === b ? "= '" + mIso(a) + "'" : "BETWEEN '" + mIso(a) + "' AND '" + mIso(b) + "'");
  }
  function period(a, b) {
    var n = b - a;
    if (n === 12) return 'in a year';
    if (ym(a)[1] === 1 && n === 11 && ym(a)[0] === ym(b)[0]) return 'over ' + ym(a)[0];
    if (n % 12 === 0 && n > 0) return 'in ' + n / 12 + ' years';
    return 'since ' + mLong(a);
  }

  /* Accounts are a running total, so a one-month dip that recovers next month usually means a reporting change. */
  function accountFlags(a, b) {
    var out = [];
    for (var i = Math.max(a, 1); i <= Math.min(b, LAST - 1); i++) {
      var prev = M.accounts.get(i - 1), cur = M.accounts.get(i), next = M.accounts.get(i + 1);
      if (cur < prev * 0.95 && cur < next * 0.95 && next >= prev) out.push(i);
    }
    return out;
  }
  // the latest earlier month with a change at least this big, for "the biggest rise since …"
  function sinceYear(key, i, up) {
    var c = pct(M[key].get(i - 1), M[key].get(i));
    for (var j = i - 1; j >= 1; j--) {
      var cj = pct(M[key].get(j - 1), M[key].get(j));
      if (up ? cj >= c : cj <= c) return ym(j)[0];
    }
    return null;
  }
  function niceTicks(lo, hi, want) {
    var span = hi - lo || Math.abs(hi) || 1;
    var raw = span / (want || 3), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var step = [1, 2, 2.5, 5, 10].map(function (k) { return k * mag; }).filter(function (s) { return s >= raw; })[0];
    var t0 = Math.floor(lo / step) * step, t1 = Math.ceil(hi / step) * step, t = [];
    for (var v = t0; v <= t1 + step / 2; v += step) t.push(Math.round(v * 1000) / 1000);
    return t;
  }
  function xTicks(idxs) {
    var n = idxs.length;
    if (n > 40) {
      var jan = idxs.map(function (i, k) { return ym(i)[1] === 1 ? k : -1; }).filter(function (k) { return k > -1; });
      var every = Math.ceil(jan.length / 6);
      return jan.filter(function (k, j) { return j % every === 0; });
    }
    var want = Math.min(n, 5), out = [];
    for (var k = 0; k < want; k++) out.push(Math.round(k * (n - 1) / (want - 1 || 1)));
    return out;
  }

  /* ---------- Answer builders ---------- */
  function work(read, col, rows, doing) {
    return ['Read your question as ' + read, 'Matched it to the column ' + col, 'Taking ' + rows, doing, 'Drawing the chart and checking the rows for gaps'];
  }
  function colNames(keys) { return keys.map(function (k) { return '“' + M[k].label + (k === 'value' ? ' (KSh billions)' : k === 'volume' || k === 'accounts' ? ' (millions)' : '') + '”'; }).join(' and '); }

  function trend(key, a, b, opts) {
    opts = opts || {};
    var m = M[key], va = m.get(a), vb = m.get(b), ch = pct(va, vb), up = ch >= 0;
    var pk = peakIn(key, a, b), flags = key === 'accounts' && !opts.skipFlags ? accountFlags(a, b) : [];
    var ratio = vb / va, title, sub;
    if (ratio >= 2) {
      title = m.subj + ' grew from ' + m.words(va) + ' in ' + mLong(a) + ' to ' + m.words(vb) + ' in ' + mLong(b) + '.';
      sub = 'That’s ' + ratio.toFixed(1) + ' times as ' + (m.plural || m.many ? 'many' : 'much') + '.';
    } else {
      title = m.subj + ' ' + (up ? 'rose ' : 'fell ') + p1(ch) + ' ' + period(a, b) + ', to ' + m.words(vb) + ' in ' + mLong(b) + '.';
      sub = 'That’s ' + (up ? 'up' : 'down') + ' from ' + m.words(va) + ' in ' + mLong(a) + '.';
    }
    if (flags.length) sub += ' ' + (flags.length === 1 ? 'One month looks like a reporting change, and it’s' : flags.length === 2 ? 'Two months look like reporting changes, and they’re' : flags.length + ' months look like reporting changes, and they’re') + ' marked on the chart.';
    else if (pk !== b && pk !== a && ratio < 2) sub += ' The highest month was ' + mLong(pk) + ', at ' + m.words(m.get(pk)) + '.';
    var marks = [{ k: 0, label: m.short(va), sub: b - a <= 24 ? mMid(a) : null, place: 'auto' }];
    if (pk !== b && pk !== a && b - a <= 24 && !flags.length) marks.push({ k: pk - a, label: m.short(m.get(pk)), sub: 'Peak · ' + mMid(pk), place: 'above' });
    marks.push({ k: b - a, label: m.short(vb), sub: b - a <= 24 ? mMid(b) : null, place: 'auto', end: true });
    flags.forEach(function (f) { marks.push({ k: f - a, label: mMid(f), sub: m.short(m.get(f)), place: 'below', flag: true }); });
    var steps = m.derived ? derivedSteps(key, a, b) : [
      'Took ' + m.lower + ' for each month from ' + mLong(a) + ' to ' + mLong(b) + ' (' + (b - a + 1) + ' rows).',
      'Compared the last month with the first: ' + m.fmt(vb) + ' against ' + m.fmt(va) + (ratio >= 2 ? ', ' + ratio.toFixed(1) + ' times as ' + (m.plural || m.many ? 'many.' : 'much.') : ', ' + (up ? 'a rise' : 'a fall') + ' of ' + p1(ch) + '.')
    ];
    if (!m.derived && pk !== b && b - a <= 24) steps.push('Found the highest month: ' + m.fmt(m.get(pk)) + ' in ' + mLong(pk) + '.');
    if (flags.length) steps.push('Checked each month against the months either side. ' + flags.map(mLong).join(' and ') + ' dip and recover, so they’re flagged, not removed.');
    var note = null;
    if (flags.length) {
      note = { kind: 'flag', title: flags.length + ' possible reporting change' + (flags.length > 1 ? 's' : ''),
        text: flags.map(function (f) { return mLong(f) + ' reads ' + m.fmt(m.get(f)) + ', between ' + m.fmt(m.get(f - 1)) + ' and ' + m.fmt(m.get(f + 1)) + '.'; }).join(' ') +
          ' Each dips for one month and recovers, which usually means a reporting change rather than accounts closing. The start and end figures aren’t affected.' };
    } else if (m.derived) note = derivedNote(key);
    return {
      kind: 'trend', status: 'answered', flags: flags.length, title: title, sub: sub,
      meta: (m.derived ? 'Worked out from ' + (key === 'avg' ? 'value ÷ volume' : 'value ÷ agents') : m.label) + ' · ' + mMid(a) + ' – ' + mMid(b),
      chart: { type: 'line', key: key, a: a, b: b, h: b - a > 40 ? 220 : 230, marks: marks, flags: flags.map(function (f) { return f - a; }) },
      steps: steps, sql: m.derived ? derivedSql(key, a, b) : sqlRange(m.sql, a, b), note: note,
      rows: { keys: m.derived ? m.uses : [key], a: a, b: b, hit: [a, b], flagged: flags },
      work: work(m.lower + (b - a === 12 ? ' over the last 12 months' : ' from ' + mMid(a) + ' to ' + mMid(b)), colNames(m.derived ? m.uses : [key]), mMid(a) + ' to ' + mMid(b) + ' (' + (b - a + 1) + ' monthly rows)', 'Working out the change'),
      follow: opts.follow || defaultFollow(key, a, b, flags),
      recent: opts.recent || recentLabel(m, a, b),
      evt: { chart: 'line', has_flag: flags.length > 0 }
    };
  }
  function recentLabel(m, a, b) {
    if (b - a === 12 && b === LAST) return m.side + ', past year';
    if (b === LAST) return m.side + ' since ' + ym(a)[0];
    return m.side + ', ' + (ym(a)[0] === ym(b)[0] ? ym(a)[0] : ym(a)[0] + '–' + String(ym(b)[0]).slice(2));
  }
  function derivedSteps(key, a, b) {
    var m = M[key];
    if (key === 'avg') {
      var s = [
        'Took two columns for each month: cash in/out value (KSh billions) and cash in/out volume (millions).',
        'Divided value by volume. For ' + mLong(b) + ': ' + M.value.get(b).toFixed(2) + ' billion ÷ ' + M.volume.get(b).toFixed(2) + ' million = KSh ' + int(m.get(b)) + '.',
        'Did the same for ' + mLong(a) + ': ' + M.value.get(a).toFixed(2) + ' billion ÷ ' + M.volume.get(a).toFixed(2) + ' million = KSh ' + int(m.get(a)) + '. That’s a ' + (m.get(b) >= m.get(a) ? 'rise' : 'fall') + ' of ' + p1(pct(m.get(a), m.get(b))) + '.'
      ];
      return s;
    }
    return [
      'Took two columns for each month: cash in/out value (KSh billions) and active agents.',
      'Divided value by agents. For ' + mLong(b) + ': KSh ' + M.value.get(b).toFixed(2) + ' billion ÷ ' + int(M.agents.get(b)) + ' agents = ' + m.words(m.get(b)) + '.',
      'Did the same for ' + mLong(a) + ': ' + m.words(m.get(a)) + '.'
    ];
  }
  function derivedSql(key, a, b) {
    return key === 'avg'
      ? 'SELECT month, value_kes_bn * 1000 / volume_m AS avg_kes\nFROM cbk_mobile_payments\nWHERE month BETWEEN \'' + mIso(a) + '\' AND \'' + mIso(b) + '\''
      : 'SELECT month, value_kes_bn * 1e9 / active_agents AS kes_per_agent\nFROM cbk_mobile_payments\nWHERE month BETWEEN \'' + mIso(a) + '\' AND \'' + mIso(b) + '\'';
  }
  function derivedNote(key) {
    return key === 'avg'
      ? { kind: 'info', text: 'This is a mean across all providers and agents. The table can’t show a typical (median) transaction.' }
      : { kind: 'info', text: 'This is an average across all agents. The table can’t show how much a typical agent handles, or how it varies by place.' };
  }
  function defaultFollow(key, a, b, flags) {
    var f = [];
    if (flags.length) f.push({ label: 'Show without the flagged months', run: function () { return smooth(a, b); } });
    if (key === 'value' && b - a === 12) {
      f.push({ label: 'Show the volume too', run: function () { return compare(['value', 'volume'], a, b, { recent: 'Value and volume, past year' }); } });
      f.push({ label: 'Compare with a year earlier', run: function () { return yoy('value'); } });
      var pk = peakIn('value', a, b);
      if (pk !== b) f.push({ label: 'Why the ' + mName(pk) + ' peak?', run: function () { return why('value', pk); } });
      return f;
    }
    if (key === 'avg' && b - a === 12) {
      f.push({ label: 'Show it since 2015', run: function () { return calcAvg(at(2015, 1), LAST); } });
      f.push({ label: 'Hide the steps', toggle: true });
      return f;
    }
    if (key === 'accounts') f.push({ label: 'Compare with active agents', run: function () { return compare(['accounts', 'agents'], a, b); } });
    else if (key === 'agents') f.push({ label: 'Compare with accounts', run: function () { return compare(['agents', 'accounts'], a, b); } });
    else if (!M[key].derived) f.push({ label: 'Show it since 2015', run: function () { return trend(key, at(2015, 1), LAST); } });
    if (b - a !== 12 || b !== LAST) f.push({ label: 'Just the past year', run: function () { return key === 'avg' ? calcAvg(LAST - 12, LAST) : trend(key, LAST - 12, LAST); } });
    return f.slice(0, 2);
  }

  // A worked-out figure for the latest month, against a year earlier
  function calcAvg(a, b) {
    var m = M.avg, va = m.get(a), vb = m.get(b);
    var r = trend('avg', a, b);
    if (b - a === 12) {
      r.title = 'The average agent transaction was KSh ' + int(vb) + ' in ' + mLong(b) + '.';
      r.sub = 'That’s ' + p1(pct(va, vb)) + ' ' + (vb >= va ? 'more' : 'less') + ' than a year earlier (KSh ' + int(va) + '). CBK doesn’t publish this figure, so Hesabu worked it out. The steps are below.';
      r.meta = 'Worked out from value ÷ volume · ' + mMid(b);
      r.recent = 'Average agent transaction';
      r.chart.h = 170;
      r.chart.marks = [{ k: 0, label: 'KSh ' + int(va), place: 'above' }, { k: b - a, label: 'KSh ' + int(vb), place: 'above', end: true }];
      r.chart.ticks = [3000, 3250, 3500];
    } else {
      r.sub = 'CBK doesn’t publish this figure, so Hesabu worked it out from value ÷ volume for every month. The steps are below.';
      r.recent = 'Average transaction, since ' + ym(a)[0];
    }
    r.kind = 'calc';
    r.stepsOpen = true;
    r.work = work('the average agent transaction', '“Cash in/out value (KSh billions)” and “Cash in/out volume (millions)”', mMid(a) + ' to ' + mMid(b) + ' (' + (b - a + 1) + ' monthly rows)', 'Dividing value by volume for each month');
    r.evt.chart = 'line';
    return r;
  }

  function perAgentYear(y) {
    var a = at(y, 1), b = Math.min(at(y, 12) < 0 ? LAST : at(y, 12), LAST);
    var vals = series('perAgent', a, b), mean = vals.reduce(function (s, v) { return s + v; }, 0) / vals.length;
    var r = trend('perAgent', a, b);
    r.kind = 'calc';
    r.title = 'In ' + y + ', each active agent handled about ' + M.perAgent.words(mean) + ' a month in cash in and out.';
    r.sub = 'That’s the month’s cash in/out value divided by active agents, averaged over ' + vals.length + ' months. CBK doesn’t publish it, so Hesabu worked it out.';
    r.meta = 'Worked out from value ÷ agents · ' + y;
    r.steps = [
      'Took two columns for each month of ' + y + ': cash in/out value (KSh billions) and active agents.',
      'Divided value by agents for each month. For example ' + mLong(b) + ': KSh ' + M.value.get(b).toFixed(2) + ' billion ÷ ' + int(M.agents.get(b)) + ' agents = ' + M.perAgent.words(M.perAgent.get(b)) + '.',
      'Averaged the ' + vals.length + ' monthly figures: ' + M.perAgent.words(mean) + '.'
    ];
    r.recent = 'Value per agent, ' + y;
    r.stepsOpen = true;
    r.work = work('value per agent in ' + y, '“Cash in/out value (KSh billions)” and “Active agents”', 'January to ' + mName(b) + ' ' + y + ' (' + vals.length + ' monthly rows)', 'Dividing value by agents for each month');
    r.follow = [{ label: 'Show it since 2015', run: function () { return trend('perAgent', at(2015, 1), LAST, { recent: 'Value per agent, since 2015' }); } }];
    return r;
  }

  // What happened in one month: the table can show the change, never the reason.
  function why(key, i) {
    var m = M[key], prev = m.get(i - 1), cur = m.get(i), ch = pct(prev, cur), up = ch >= 0;
    var nx = i < LAST ? pct(cur, m.get(i + 1)) : 0, reverses = i < LAST && Math.abs(nx) >= 5 && (nx >= 0) !== up;
    var verb = up ? (Math.abs(ch) >= 10 ? 'jumped' : 'rose') : (Math.abs(ch) >= 10 ? 'dropped' : 'fell');
    var title = m.subj + ' ' + verb + ' ' + p1(ch) + ' in ' + mLong(i) + ', to ' + m.words(cur) + '.';
    if (reverses) title += ' Then ' + (m.plural ? 'they' : 'it') + ' ' + (nx >= 0 ? 'rose ' : 'fell ') + p1(nx) + ' in ' + mName(i + 1) + '.';
    var y1 = sinceYear(key, i, up), y2 = reverses ? sinceYear(key, i + 1, nx >= 0) : null;
    var sub = (y1 ? 'It was the biggest monthly ' + (up ? 'rise' : 'fall') + ' since ' + y1 : 'It was the biggest monthly ' + (up ? 'rise' : 'fall') + ' in the table') +
      (reverses ? (y2 ? ', then the biggest ' + (nx >= 0 ? 'rise' : 'fall') + ' since ' + y2 : ', then the biggest ' + (nx >= 0 ? 'rise' : 'fall') + ' in the table') : '') + '. This data shows what happened, but not why.';
    if (key === 'value' && !reverses && i === peakIn('value', 0, LAST)) sub = 'It’s the highest month in the table so far. This data shows what happened, but not why.';
    var b = Math.min(LAST, Math.max(i + 6, 11)), a = b - 11;
    var labels = [i - 1, i]; if (reverses) labels.push(i + 1);
    var noteText = key === 'agents'
      ? 'Why it happened. The table only counts agents each month. It has no reasons, regions or providers, so it can’t say whether ' + mName(i) + ' was new agents or a change in how they were counted. CBK’s reports or provider announcements from ' + mLong(i) + ' are the place to check.'
      : 'Why it happened. The table only has one national total for each month. It has no reasons, regions or providers, so it can’t say what drove ' + mLong(i) + '. CBK’s reports or provider announcements from ' + mLong(i) + ' are the place to check.';
    return {
      kind: 'partly', status: 'partly', title: title, sub: sub,
      meta: m.label + ' · ' + mMid(a) + ' – ' + mMid(b),
      chart: { type: 'bars', key: key, a: a, b: b, h: 210, hi: i - a, labels: labels.map(function (j) { return j - a; }) },
      note: { kind: 'warn', title: 'What this data can’t tell you', text: noteText },
      steps: [
        'Took ' + m.lower + ' for each month from ' + mLong(a) + ' to ' + mLong(b) + ' (' + (b - a + 1) + ' rows).',
        'Worked out each month’s change on the month before: ' + mName(i) + ' was ' + (up ? '+' : '−') + p1(ch) + (reverses ? ', ' + mName(i + 1) + ' ' + (nx >= 0 ? '+' : '−') + p1(nx) : '') + '. Checked back to ' + ym(0)[0] + ' for anything bigger.'
      ],
      sql: 'SELECT month, ' + m.sql + ',\n       ' + m.sql + ' / LAG(' + m.sql + ') OVER (ORDER BY month) - 1 AS change\nFROM cbk_mobile_payments\nWHERE month BETWEEN \'' + mIso(a) + '\' AND \'' + mIso(b) + '\'',
      stepsOpen: false,
      rows: { keys: [key], a: a, b: b, hit: labels, flagged: [] },
      work: ['Read your question as a change in ' + m.lower + ' in ' + mLong(i), 'Matched it to the column ' + colNames([key]), 'Taking ' + mMid(a) + ' to ' + mMid(b) + ' (' + (b - a + 1) + ' monthly rows)', 'Comparing each month with the one before', 'Checking whether the table can say why'],
      follow: key === 'agents'
        ? [{ label: 'Show agents since 2020', run: function () { return trend('agents', at(2020, 1), LAST); } }, { label: 'Compare with accounts', run: function () { return compare(['agents', 'accounts'], a, b); } }]
        : [{ label: 'Show the volume that month', run: function () { return single('volume', i); } }, { label: 'Show it since 2015', run: function () { return trend(key, at(2015, 1), LAST); } }],
      recent: m.side + ' in ' + mLong(i),
      evt: { chart: 'bars', has_flag: false }
    };
  }

  function compare(keys, a, b, opts) {
    opts = opts || {};
    var m1 = M[keys[0]], m2 = M[keys[1]];
    var c1 = pct(m1.get(a), m1.get(b)), c2 = pct(m2.get(a), m2.get(b));
    function said(m, c) { var r = m.get(b) / m.get(a); return m.lower + (r >= 2 ? ' grew ' + r.toFixed(1) + ' times' : (c >= 0 ? ' rose ' : ' fell ') + p1(c)); }
    var faster = c1 >= c2 ? m1 : m2;
    var title = 'From ' + mLong(a) + ' to ' + mLong(b) + ', ' + said(m1, c1) + ' and ' + said(m2, c2) + '.';
    return {
      kind: 'compare', status: 'answered', title: title,
      sub: 'Both lines start at 100 so you can compare growth, not size. ' + faster.label + ' grew faster' + (Math.abs(c1 - c2) < 2 ? ', but only just.' : '.'),
      meta: m1.label + ' and ' + m2.label.toLowerCase() + ' · ' + mMid(a) + ' – ' + mMid(b),
      chart: { type: 'compare', keys: keys, a: a, b: b, h: 220 },
      steps: [
        'Took ' + m1.lower + ' and ' + m2.lower + ' for each month from ' + mLong(a) + ' to ' + mLong(b) + ' (' + (b - a + 1) + ' rows).',
        'Set each to 100 in ' + mLong(a) + ', so ' + mLong(b) + ' reads ' + Math.round(100 * m1.get(b) / m1.get(a)) + ' for ' + m1.lower + ' and ' + Math.round(100 * m2.get(b) / m2.get(a)) + ' for ' + m2.lower + '.'
      ],
      sql: 'SELECT month,\n       100 * ' + m1.sql + ' / FIRST_VALUE(' + m1.sql + ') OVER w AS ' + keys[0] + '_index,\n       100 * ' + m2.sql + ' / FIRST_VALUE(' + m2.sql + ') OVER w AS ' + keys[1] + '_index\nFROM cbk_mobile_payments\nWHERE month BETWEEN \'' + mIso(a) + '\' AND \'' + mIso(b) + '\'\nWINDOW w AS (ORDER BY month)',
      note: { kind: 'info', text: 'Growth only. ' + m1.label + ' and ' + m2.label.toLowerCase() + ' are counted in different units, so the table can’t say one causes the other.' },
      rows: { keys: keys, a: a, b: b, hit: [a, b], flagged: [] },
      work: work(m1.lower + ' against ' + m2.lower, colNames(keys), mMid(a) + ' to ' + mMid(b) + ' (' + (b - a + 1) + ' monthly rows)', 'Setting both to 100 at the start'),
      follow: opts.follow || [{ label: 'Just ' + m1.lower, run: function () { return trend(keys[0], a, b); } }, { label: 'Just ' + m2.lower, run: function () { return trend(keys[1], a, b); } }],
      recent: opts.recent || (m1.side + ' vs ' + m2.side.toLowerCase() + ', ' + (ym(a)[0] === ym(b)[0] ? ym(a)[0] : ym(a)[0] + '–' + String(ym(b)[0]).slice(2))),
      evt: { chart: 'compare', has_flag: false }
    };
  }

  function yoy(key) {
    var m = M[key], b = LAST, a = LAST - 11, pa = a - 12, pb = b - 12;
    var cur = series(key, a, b).reduce(function (s, v) { return s + v; }, 0), prev = series(key, pa, pb).reduce(function (s, v) { return s + v; }, 0);
    var ch = pct(prev, cur);
    var tot = key === 'value' ? 'KSh ' + (cur / 1000).toFixed(2) + ' trillion' : m.words(cur);
    return {
      kind: 'compare', status: 'answered',
      title: 'Over the 12 months to ' + mLong(b) + ', agents handled ' + tot + ' in cash in and out, ' + p1(ch) + ' ' + (ch >= 0 ? 'more' : 'less') + ' than the 12 months before.',
      sub: 'The chart lines up the same months a year apart. ' + range(0, 11).filter(function (k) { return m.get(a + k) > m.get(pa + k); }).length + ' of the 12 months were higher this time.',
      meta: m.label + ' · ' + mMid(a) + ' – ' + mMid(b) + ' against ' + mMid(pa) + ' – ' + mMid(pb),
      chart: { type: 'yoy', key: key, a: a, b: b, h: 220 },
      steps: [
        'Took ' + m.lower + ' for the 12 months to ' + mLong(b) + ' and the 12 months to ' + mLong(pb) + ' (24 rows).',
        'Added up each year: ' + (cur).toFixed(2) + ' billion against ' + prev.toFixed(2) + ' billion, ' + (ch >= 0 ? 'a rise' : 'a fall') + ' of ' + p1(ch) + '.'
      ],
      sql: 'SELECT SUM(' + m.sql + ') FILTER (WHERE month BETWEEN \'' + mIso(a) + '\' AND \'' + mIso(b) + '\') AS this_year,\n       SUM(' + m.sql + ') FILTER (WHERE month BETWEEN \'' + mIso(pa) + '\' AND \'' + mIso(pb) + '\') AS year_before\nFROM cbk_mobile_payments',
      rows: { keys: [key], a: pa, b: b, hit: [], flagged: [] },
      work: work(m.lower + ', this year against last year', colNames([key]), mMid(pa) + ' to ' + mMid(b) + ' (24 monthly rows)', 'Adding up each 12 months'),
      follow: [{ label: 'Show the volume too', run: function () { return compare(['value', 'volume'], LAST - 12, LAST, { recent: 'Value and volume, past year' }); } }],
      recent: 'Value, year on year',
      evt: { chart: 'compare', has_flag: false }
    };
  }

  function smooth(a, b) {
    var r = trend('accounts', a, b, { skipFlags: true });
    var fl = accountFlags(a, b);
    r.title = 'With ' + fl.map(mLong).join(' and ') + ' left out, registered accounts grew steadily from ' + M.accounts.words(M.accounts.get(a)) + ' to ' + M.accounts.words(M.accounts.get(b)) + '.';
    r.sub = 'The flagged months are skipped and the line joins their neighbours. The start and end are the same, so it’s still ' + (M.accounts.get(b) / M.accounts.get(a)).toFixed(1) + ' times as many.';
    r.meta = 'Registered accounts · ' + mMid(a) + ' – ' + mMid(b) + ' · ' + fl.length + ' months left out';
    r.chart.skip = fl.map(function (f) { return f - a; });
    r.steps = r.steps.concat(['Left out ' + fl.map(mLong).join(' and ') + ' and joined the line between the months either side.']);
    r.follow = [{ label: 'Put the flagged months back', run: function () { return trend('accounts', a, b); } }];
    r.recent = 'Accounts, flags left out';
    return r;
  }

  function single(key, i) {
    var m = M[key], v = m.get(i), mo = i >= 1 ? pct(m.get(i - 1), v) : null, yr = i >= 12 ? pct(m.get(i - 12), v) : null;
    var a = Math.max(0, i - 12);
    var title = key === 'agents' ? 'There were ' + int(v) + ' active agents in ' + mLong(i) + '.'
      : key === 'accounts' ? 'There were ' + m.words(v) + ' registered mobile money accounts in ' + mLong(i) + '.'
      : key === 'volume' ? 'Agents handled ' + m.words(v) + ' in cash in and out in ' + mLong(i) + '.'
      : key === 'avg' ? 'The average agent transaction was KSh ' + int(v) + ' in ' + mLong(i) + '.'
      : 'Agents handled ' + m.words(v) + ' in cash in and out in ' + mLong(i) + '.';
    var parts = [];
    if (mo !== null) parts.push((mo >= 0 ? 'up ' : 'down ') + p1(mo) + ' on ' + mLong(i - 1));
    if (yr !== null) parts.push((yr >= 0 ? 'up ' : 'down ') + p1(yr) + ' on ' + mLong(i - 12));
    return {
      kind: 'single', status: 'answered', title: title,
      sub: parts.length ? 'That’s ' + parts.join(' and ') + '.' : 'It’s the first month in the table.',
      meta: m.label + ' · ' + mMid(i),
      chart: { type: 'line', key: key, a: a, b: i, h: 170, marks: [{ k: i - a, label: m.short(v), sub: mMid(i), place: 'auto', end: true }] },
      steps: ['Found the row for ' + mLong(i) + ' and read ' + (m.derived ? 'value and volume, then divided them' : 'the ' + m.label + ' column') + '.', 'Compared it with ' + mLong(i - 1) + (i >= 12 ? ' and ' + mLong(i - 12) : '') + '.'],
      sql: m.derived ? derivedSql(key, i, i) : sqlRange(m.sql, i, i),
      note: m.derived ? derivedNote(key) : null,
      rows: { keys: m.derived ? m.uses : [key], a: a, b: i, hit: [i], flagged: [] },
      work: work(m.lower + ' in ' + mLong(i), colNames(m.derived ? m.uses : [key]), 'the row for ' + mMid(i) + ' and the year before it', 'Reading the figure and the changes'),
      follow: [{ label: 'Show the year to ' + mName(i), run: function () { return key === 'avg' ? calcAvg(Math.max(0, i - 12), i) : trend(key, Math.max(0, i - 12), i); } }],
      recent: m.side + ', ' + mMid(i),
      evt: { chart: 'line', has_flag: false }
    };
  }

  var CANT = {
    provider: ['I can’t answer that. The CBK table doesn’t split figures by provider.',
      'It gives one total for all mobile money providers each month, so there’s no way to separate M-Pesa from the others. Provider figures come from the providers’ own reports, which aren’t in this dataset.', 'M-Pesa’s share'],
    region: ['I can’t answer that. The CBK table doesn’t split figures by place.',
      'It gives one national total each month, with no counties, towns or regions. Figures by place would need a different source, such as the FinAccess household survey.', 'Figures by place'],
    people: ['I can’t answer that. The CBK table doesn’t say who the users are.',
      'It counts accounts, agents and agent transactions, with nothing on age, gender or income. Survey data, such as FinAccess, covers who uses mobile money.', 'Who the users are'],
    fees: ['I can’t answer that. The CBK table has no fees or charges.',
      'It only counts agents, accounts and agent cash in/out. Tariffs come from each provider, and they aren’t in this dataset.', 'Fees and charges'],
    daily: ['I can’t answer that. The CBK table only has monthly totals.',
      'There’s one row per month, so days and weeks aren’t in it. Hesabu can show any month back to ' + mLong(0) + '.', 'Daily figures'],
    future: ['I can’t answer that. Hesabu doesn’t forecast.',
      'The table stops at the latest month CBK has published, ' + mLong(LAST) + '. Hesabu only answers from published months, so it can show the trend up to now, but not what comes next.', 'A forecast'],
    early: ['I can’t answer that. The CBK table starts in ' + mLong(0) + '.',
      'There are no rows before mobile money had agents, so earlier years aren’t in this dataset.', 'Before ' + ym(0)[0]],
    unknown: ['I can’t answer that from this table.',
      'It has four measures for each month since ' + mLong(0) + ': active agents, registered accounts, and agent cash in/out volume and value. Try asking about one of those.', 'An unclear question']
  };
  function cant(topic) {
    var c = CANT[topic] || CANT.unknown;
    return {
      kind: 'cant', status: 'cant', title: c[0], sub: c[1], meta: '',
      tiles: [
        { v: M.value.fmt(M.value.get(LAST)), l: 'Cash in/out value, all providers, ' + mMid(LAST) },
        { v: M.volume.fmt(M.volume.get(LAST)), l: 'Cash in/out transactions, all providers, ' + mMid(LAST) },
        { v: int(M.agents.get(LAST)), l: 'Active agents, ' + mMid(LAST) }
      ],
      cta: { label: topic === 'future' ? 'Show the trend up to now' : 'Show the all-provider trend', run: function () { return trend('value', at(2015, 1), LAST, { recent: 'All-provider value, since 2015' }); } },
      cols: BASE.map(function (k) { return M[k].label; }),
      rows: { keys: BASE, a: LAST - 12, b: LAST, hit: [LAST], flagged: [] },
      work: ['Read your question', 'Looked for a matching column in the CBK table', 'Checked the four measures it has', 'No column can answer this', 'Finding what the table can tell you instead'],
      follow: [{ label: 'What can I ask?', run: help }],
      recent: c[2],
      evt: { chart: 'none', has_flag: false }
    };
  }
  function help() {
    return {
      kind: 'help', status: 'answered', title: 'Here’s what I can answer from the CBK Mobile Payments table.',
      sub: 'Four measures, one row per month from ' + mLong(0) + ' to ' + mLong(LAST) + '. Every answer shows its steps and the rows it used.',
      meta: 'What Hesabu can answer',
      helpList: [
        'How a measure changed: “How have registered accounts grown since 2015?”',
        'One month’s figure: “How many active agents were there in June?”',
        'Figures worked out from two columns: the average agent transaction, or value per agent.',
        'Two measures side by side: “Compare agents and accounts in 2020.”',
        'What happened in a month, though never why: the table has no reasons.'
      ],
      cols: BASE.map(function (k) { return M[k].label; }),
      noteCant: 'It can’t answer by provider (such as M-Pesa), by place, by who the users are, about fees, by day, or about the future.',
      rows: null,
      work: ['Read your question as a request for help', 'Listed the columns in the CBK table', 'Taking the full table (' + N + ' monthly rows)', 'Grouping what it can and can’t answer', 'Writing it up'],
      follow: [
        { label: 'How has agent value changed over the past year?', run: function () { return trend('value', LAST - 12, LAST, { recent: 'Agent value, past year' }); } },
        { label: 'How have registered accounts grown since 2015?', run: function () { return trend('accounts', at(2015, 1), LAST, { recent: 'Accounts since 2015' }); } }
      ],
      recent: 'What can I ask?',
      evt: { chart: 'none', has_flag: false }
    };
  }

  /* ---------- Reading a question ---------- */
  function route(text) {
    var t = ' ' + text.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ') + ' ';
    if (/m-?pesa|airtel|t-?kash|safaricom|telkom|equitel|\bprovider|operator|telco|market share|which network/.test(t)) return cant('provider');
    if (/count(y|ies)|region|nairobi|mombasa|kisumu|nakuru|eldoret|\btowns?\b|rural|urban|where in kenya|by place|location/.test(t)) return cant('region');
    if (/gender|women|\bmen\b|\bage\b|youth|young|income|\bpoor\b|who uses|demograph/.test(t)) return cant('people');
    if (/\bfee|charges?\b|tariff|commission|\btax|levy|excise|\bcost/.test(t)) return cant('fees');
    if (/forecast|predict|projection|next (month|year)|will (there|it|they|agents|accounts|value|volume)|\b20(2[7-9]|[3-9]\d)\b|future/.test(t)) return cant('future');
    if (/daily|per day|each day|weekly|per week|hourly|today/.test(t)) return cant('daily');
    if (/\b(19\d\d|200[0-6])\b/.test(t)) return cant('early');
    if (/what can i ask|help|what do you (know|have)|what can you/.test(t)) return help();

    var years = (t.match(/\b20(0[7-9]|1\d|2[0-6])\b/g) || []).map(Number);
    var mi = -1;
    MONTHS.forEach(function (name, k) { if (new RegExp('\\b(' + name.toLowerCase() + '|' + name.slice(0, 3).toLowerCase() + ')\\b').test(t)) mi = k + 1; });
    var month = -1;
    if (mi > 0) {
      var y = years.length ? years[0] : null;
      if (y) month = at(y, mi);
      else for (var j = LAST; j >= 0; j--) if (ym(j)[1] === mi) { month = j; break; }
    }

    var keys = [];
    var isAvg = /average|mean|per transaction|transaction size|typical transaction|size of (a|the) transaction/.test(t);
    var isPerAgent = /per agent|each agent|value per|an agent handle/.test(t);
    if (isPerAgent) keys.push('perAgent');
    else if (isAvg) keys.push('avg');
    if (!isPerAgent && !isAvg) {
      if (/\bagents?\b(?! (value|cash|volume|transaction))/.test(t) && !/agent (value|cash|volume|transactions?)/.test(t)) keys.push('agents');
      if (/account|subscri|wallet|registered|users/.test(t)) keys.push('accounts');
      if (/volume|transactions|how many times|number of (cash|transactions)/.test(t)) keys.push('volume');
      if (/\bvalue\b/.test(t) || (/worth|amount|how much|\bksh\b|shilling|billion|money|cash/.test(t) && keys.indexOf('volume') < 0)) keys.push('value');
      if (/agent (value|cash)/.test(t) && keys.indexOf('value') < 0) keys.push('value');
    }
    var isWhy = /\bwhy\b|cause|reason|what happened|explain|jump|spike|drop|plunge|surge/.test(t);
    var isCompare = keys.length > 1 || /compare| vs |versus|against/.test(t);
    var a = LAST - 12, b = LAST, hasRange = false;
    if (/since|from|ever|all time|history|start/.test(t) && years.length) { a = at(years[0], 1); b = years[1] ? Math.min(at(years[1], 12) < 0 ? LAST : at(years[1], 12), LAST) : LAST; hasRange = true; }
    else if (/all time|ever|history|since (the )?start|since launch/.test(t)) { a = 0; b = LAST; hasRange = true; }
    else if (years.length && month < 0) { a = at(years[0], 1); b = at(years[0], 12) < 0 ? LAST : at(years[0], 12); hasRange = true; }
    var now = /\bnow\b|latest|current|lately|most recent|this month/.test(t);

    if (!keys.length) {
      return cant('unknown');
    }
    if (isCompare && keys.length < 2) keys.push(keys[0] === 'agents' ? 'accounts' : 'agents');
    if (isCompare) return compare(keys.slice(0, 2), a, b);
    var key = keys[0];
    if (key === 'perAgent') return perAgentYear(years.length ? years[0] : ym(LAST)[0] - (ym(LAST)[1] < 12 ? 1 : 0));
    if (isWhy) {
      if (month < 0) { // the biggest move in the range
        var best = Math.max(a, 1);
        for (var k = Math.max(a, 1); k <= b; k++) if (Math.abs(pct(M[key].get(k - 1), M[key].get(k))) > Math.abs(pct(M[key].get(best - 1), M[key].get(best)))) best = k;
        month = best;
      }
      return why(key === 'avg' ? 'value' : key, month);
    }
    if (month > -1) return single(key, month);
    if (key === 'avg') return calcAvg(hasRange ? a : LAST - 12, hasRange ? b : LAST);
    if (now && !hasRange) return single(key, LAST);
    return trend(key, a, b);
  }

  /* ---------- Charts ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, txt) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (txt != null) e.textContent = txt; return e; }
  var GRAD = 0;

  function drawChart(host, c) {
    host.innerHTML = '';
    var W = Math.max(280, Math.round(host.clientWidth || 710)), H = c.h || 220;
    var phone = W < 520;
    var L = phone ? 44 : 52, R = 14, T = 28, B = 26;
    var svg = svgEl('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    var gid = 'hb-area-' + (++GRAD);
    var defs = svgEl('defs', {}), lg = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
    lg.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#2D7FF9', 'stop-opacity': '.16' }));
    lg.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#2D7FF9', 'stop-opacity': '0' }));
    defs.appendChild(lg); svg.appendChild(defs);

    var lines = [], idxs = range(c.a, c.b), fmtAxis, ticks, label;
    if (c.type === 'line' || c.type === 'bars') {
      var m = M[c.key];
      lines = [{ vals: series(c.key, c.a, c.b), color: '#2D7FF9', area: c.type === 'line' }];
      fmtAxis = m.axis;
      label = m.label + ', ' + mMid(c.a) + ' to ' + mMid(c.b) + '. ';
    } else if (c.type === 'compare') {
      lines = c.keys.map(function (k, n) { var base = M[k].get(c.a); return { vals: series(k, c.a, c.b).map(function (v) { return 100 * v / base; }), color: n ? '#7C39ED' : '#2D7FF9', name: M[k].label, area: false }; });
      fmtAxis = function (v) { return String(v); };
      label = 'Index, ' + mMid(c.a) + ' = 100. ';
    } else if (c.type === 'yoy') {
      lines = [{ vals: series(c.key, c.a - 12, c.b - 12), color: '#9CC7FF', name: mMid(c.a - 12) + ' – ' + mMid(c.b - 12), area: false },
               { vals: series(c.key, c.a, c.b), color: '#2D7FF9', name: mMid(c.a) + ' – ' + mMid(c.b), area: true }];
      fmtAxis = M[c.key].axis;
      label = M[c.key].label + ', two years compared. ';
    }
    var all = [].concat.apply([], lines.map(function (l) { return l.vals.filter(function (v, k) { return !(c.skip && c.skip.indexOf(k) > -1); }); }));
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    if (c.type === 'bars') lo = 0;
    ticks = c.ticks || niceTicks(lo, hi, 4);
    if (c.type === 'bars') { var unit = Math.pow(10, Math.floor(Math.log10(hi)) - 1) * 5, st = Math.ceil(hi * 1.05 / 2 / unit) * unit; ticks = [0, st, st * 2]; }
    var y0 = ticks[0], y1 = ticks[ticks.length - 1];
    var n = idxs.length;
    function X(k) { return c.type === 'bars' ? L + (k + .5) * (W - L - R) / n : L + (n === 1 ? 0 : k * (W - L - R) / (n - 1)); }
    function Y(v) { return T + (H - T - B) * (1 - (v - y0) / (y1 - y0)); }

    var g = svgEl('g', {});
    ticks.forEach(function (tv) {
      g.appendChild(svgEl('rect', { x: L, y: Math.round(Y(tv)), width: W - L - R, height: 1, fill: '#E8E8E8' }));
      g.appendChild(svgEl('text', { x: L - 10, y: Y(tv) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#757575' }, fmtAxis(tv)));
    });
    var xt = c.type === 'yoy' ? xTicks(range(c.a, c.b)) : (c.type === 'bars' ? barTicks(c, phone) : xTicks(idxs));
    xt.forEach(function (k) {
      var anchor = c.type === 'bars' ? 'middle' : (k === 0 ? 'start' : k === n - 1 ? 'end' : 'middle');
      var x = X(k) + (c.type !== 'bars' && k === 0 ? -4 : c.type !== 'bars' && k === n - 1 ? 4 : 0);
      g.appendChild(svgEl('text', { x: x, y: H - 6, 'text-anchor': anchor, 'font-size': 11, fill: '#757575' }, c.type === 'yoy' ? MON[ym(idxs[k])[1] - 1] : mShort(idxs[k])));
    });
    svg.appendChild(g);

    if (c.type === 'bars') {
      var bw = (W - L - R) / n * .62;
      lines[0].vals.forEach(function (v, k) {
        svg.appendChild(svgEl('rect', { x: X(k) - bw / 2, y: Y(v), width: bw, height: Y(y0) - Y(v), rx: 3, fill: k === c.hi ? '#2D7FF9' : '#CFDFFF' }));
      });
      (phone ? [c.hi] : (c.labels || [])).forEach(function (k) {
        svg.appendChild(svgEl('text', { x: X(k), y: Y(lines[0].vals[k]) - 8, 'text-anchor': 'middle', 'font-size': phone ? 11 : 13, 'font-weight': 600, fill: '#333333' }, M[c.key].short(lines[0].vals[k])));
      });
    } else {
      lines.forEach(function (ln) {
        var pts = [];
        ln.vals.forEach(function (v, k) { if (!(c.skip && c.skip.indexOf(k) > -1)) pts.push([X(k), Y(v)]); });
        var d = pts.map(function (p, k) { return (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('');
        if (ln.area) svg.appendChild(svgEl('path', { d: d + 'L' + pts[pts.length - 1][0].toFixed(1) + ' ' + Y(y0) + 'L' + pts[0][0].toFixed(1) + ' ' + Y(y0) + 'Z', fill: 'url(#' + gid + ')' }));
        svg.appendChild(svgEl('path', { d: d, fill: 'none', stroke: ln.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      });
      if (lines.length > 1) {
        var lgx = L, lgy = 10;
        lines.slice().reverse().forEach(function (ln) {
          svg.appendChild(svgEl('rect', { x: lgx, y: lgy - 4, width: 12, height: 3, rx: 1.5, fill: ln.color }));
          var tx = svgEl('text', { x: lgx + 18, y: lgy, 'font-size': 11, fill: '#333333' }, ln.name);
          svg.appendChild(tx);
          lgx += 18 + ln.name.length * 6.2 + 18;
        });
      }
      var flagN = 0;
      (c.marks || []).forEach(function (mk) {
        var v = lines[0].vals[mk.k], x = X(mk.k), y = Y(v), col = mk.flag ? '#D74D26' : '#2D7FF9';
        svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 4, fill: '#FFFFFF', stroke: col, 'stroke-width': 2 }));
        var low = (y - T) / (H - T - B) > .7;
        var below = mk.place === 'below' || (mk.place !== 'above' && mk.sub && !low);
        var anchor = x < L + 50 ? 'start' : x > W - R - 60 ? 'end' : 'middle';
        if (mk.flag) anchor = flagN++ % 2 ? 'start' : 'end';
        var lx = anchor === 'start' ? x - (mk.flag ? -6 : 4) : anchor === 'end' ? x + (mk.flag ? -6 : 4) : x;
        var ly = below ? y + 20 : (mk.sub && (!phone || mk.flag) ? y - 25 : y - 11);
        svg.appendChild(svgEl('text', { x: lx, y: ly, 'text-anchor': anchor, 'font-size': phone ? 11 : 13, 'font-weight': 600, fill: mk.flag ? '#D74D26' : '#333333' }, mk.label));
        if (mk.sub && (!phone || mk.flag)) svg.appendChild(svgEl('text', { x: lx, y: ly + 15, 'text-anchor': anchor, 'font-size': 11, fill: mk.flag ? '#D74D26' : '#757575' }, mk.sub));
      });
    }
    var sum = lines.map(function (l) { return (l.name ? l.name + ': ' : '') + 'from ' + fmtAxis(Math.round(l.vals[0] * 100) / 100) + ' to ' + fmtAxis(Math.round(l.vals[l.vals.length - 1] * 100) / 100); }).join('; ');
    svg.setAttribute('aria-label', label + sum + '. The full rows are under Open table.');
    host.appendChild(svg);
  }
  // Every other month, plus the labelled bars and the last one, never two side by side unless both are labelled
  function barTicks(c, phone) {
    var n = c.b - c.a, lab = phone ? [c.hi] : (c.labels || [c.hi]), cand = phone ? [0, n] : [];
    if (!phone) for (var k = 0; k <= n; k += 2) cand.push(k);
    cand = cand.concat(lab, [n]).filter(function (k, j, arr) { return arr.indexOf(k) === j; }).sort(function (x, y) { return x - y; });
    var keep = cand.filter(function (k) { return lab.indexOf(k) > -1 || !lab.some(function (j) { return Math.abs(j - k) === 1; }); });
    return keep.filter(function (k, j) { return k === n || lab.indexOf(k) > -1 || keep[j + 1] === undefined || keep[j + 1] - k > 1; });
  }

  /* ---------- Events (the PostHog plan, counted live for this visit) ---------- */
  var EVENTS = [
    ['question_asked', 'A question is sent', ['source', 'steps_on'], 'What people ask, and whether suggestions help them start'],
    ['answer_shown', 'An answer finishes', ['status', 'has_flag', 'chart', 'ms'], 'How often Hesabu can answer at all, and how fast'],
    ['steps_opened', '“How I got this” opens', ['status', 'by_default'], 'A trust signal: people checking the working'],
    ['source_opened', '“Open table” is clicked', ['status'], 'Whether people check numbers against CBK'],
    ['followup_clicked', 'A follow-up is used', ['from_status', 'followup'], 'Which next questions are worth suggesting'],
    ['refusal_next_step', 'An alternative is used after “Can’t answer”', ['alternative'], 'Whether a refusal still helps'],
    ['answer_rated', 'Thumbs up or down', ['rating', 'status'], 'Quality, split by answered, partly and can’t answer']
  ];
  var counts = {}, lastProps = {};
  function track(name, props) {
    counts[name] = (counts[name] || 0) + 1;
    lastProps[name] = props || {};
    if (window.console && console.debug) console.debug('[hesabu event]', name, props || {});
    if (!$('#plan').hidden) renderPlan();
  }

  /* ---------- State and rendering ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var S;
  var YESTERDAY = [
    { label: 'Agents vs accounts, 2020', run: function () { return compare(['agents', 'accounts'], at(2020, 1), at(2020, 12), { recent: 'Agents vs accounts, 2020' }); }, q: 'Compare agents and accounts in 2020' },
    { label: 'Value per agent, 2024', run: function () { return perAgentYear(2024); }, q: 'What was the value per agent in 2024?' }
  ];
  function fresh() { return { turns: [], today: [], dsOpen: null, steps: false, busy: false, current: -1, view: 'app', thread: 0 }; }

  var view = $('#view'), dock = $('#dock'), scroll = $('#scroll');

  function renderChrome() {
    $$('[data-new].logo').forEach(function (b) { b.innerHTML = '<span class="logo__mark">' + MARK + '</span><span class="logo__word">Hesabu</span>'; });
    $('.btn--new').innerHTML = icon('plus') + 'New question';
    $('[data-share]').innerHTML = icon('share') + 'Share';
  }

  function renderDataset() {
    var open = S.dsOpen === null ? !S.turns.length : S.dsOpen;
    var a = LAST - 12;
    var html = '<div class="ds' + (open ? '' : ' is-collapsed') + '"><div class="ds__head"><span class="ds__badge">' + icon('grid') + '</span>' +
      '<span class="ds__title"><span class="ds__name">Mobile Payments</span><span class="ds__org">Central Bank of Kenya</span></span>' +
      '<button type="button" class="ds__toggle" data-ds aria-expanded="' + open + '" aria-label="' + (open ? 'Hide' : 'Show') + ' the measures">' + icon(open ? 'chevronUp' : 'chevronDown') + '</button></div>' +
      '<p class="ds__fresh"><span class="ds__dot" aria-hidden="true"></span>' + (open ? 'Monthly · to ' + mMid(LAST) + ' · retrieved ' + D.retrieved.replace(/ \d{4}$/, '') : 'Monthly · 4 measures · to ' + mMid(LAST)) + '</p>' +
      '<p class="ds__cap"><span class="caps">4 measures</span><span>Last 13 months</span></p><div class="ds__list">';
    BASE.forEach(function (k) {
      var vals = series(k, a, LAST), lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
      var pts = vals.map(function (v, j) { return (j * 58 / 12 + 1).toFixed(1) + ',' + (19 - 16 * (v - lo) / (hi - lo || 1)).toFixed(1); });
      var last = pts[pts.length - 1].split(',');
      html += '<div class="ms"><span class="ms__txt"><span class="ms__label">' + M[k].label + '</span><span class="ms__val">' + M[k].fmt(M[k].get(LAST)) + '</span></span>' +
        '<svg width="60" height="22" viewBox="0 0 60 22" aria-hidden="true"><polyline points="' + pts.join(' ') + '" fill="none" stroke="#2D7FF9" stroke-width="1.2" stroke-linejoin="round"/><circle cx="' + last[0] + '" cy="' + last[1] + '" r="2" fill="#2D7FF9"/></svg></div>';
    });
    html += '</div><p class="ds__note">' + icon('infoS') + '<span>CBK publishes no definitions for these columns. Hesabu answers only from these four.</span></p></div>';
    $('#dataset').innerHTML = html;
  }

  function renderRecent() {
    var html = '';
    if (S.today.length) {
      html += '<p class="caps recent__day">Today</p>';
      S.today.slice().reverse().forEach(function (r) {
        html += '<button type="button" class="recent__item" data-today="' + S.today.indexOf(r) + '"' + (r.thread === S.thread && S.current === r.turn ? ' aria-current="true"' : '') + '>' + icon('history') + '<span>' + esc(r.label) + '</span></button>';
      });
    }
    html += '<p class="caps recent__day">Yesterday</p>';
    YESTERDAY.forEach(function (y, k) { html += '<button type="button" class="recent__item" data-yday="' + k + '">' + icon('history') + '<span>' + esc(y.label) + '</span></button>'; });
    $('#recent').innerHTML = html;
  }

  var EXAMPLES = [
    { q: 'How has agent value changed over the past year?', tag: 'Trend', ic: 'chart' },
    { q: 'What’s the average agent transaction now?', tag: 'Calculation', ic: 'formula' },
    { q: 'Why did active agents jump in March 2026?', tag: 'What happened', ic: 'bulb' },
    { q: 'How much of this went through M-Pesa?', tag: 'Breakdown', ic: 'pie' }
  ];
  function composer(kind) {
    var start = kind === 'start';
    return '<form class="composer composer--' + (start ? 'start' : 'follow') + '" data-ask novalidate>' +
      '<label class="sr-only" for="q-' + kind + '">' + (start ? 'Ask a question about Kenya’s mobile money' : 'Ask a follow-up') + '</label>' +
      '<textarea id="q-' + kind + '" rows="1" placeholder="' + (start ? 'For example: how many active agents were there in June?' : 'Ask a follow-up…') + '" maxlength="240"></textarea>' +
      (start ? '<div class="composer__row">' : '') +
      '<span class="select">' + '<select aria-label="Dataset"><option>CBK Mobile Payments</option></select>' + CARET + '</span>' +
      '<button type="button" class="switch" role="switch" aria-checked="' + S.steps + '" data-steps-switch><span class="switch__track"><span class="switch__knob"></span></span>' + icon('checklist', 'switch__icon') + '<span class="switch__label">Show steps</span></button>' +
      (start ? '<span class="composer__spacer"></span>' : '') +
      '<button type="submit" class="send" aria-label="Ask">' + icon('up') + '</button>' +
      (start ? '</div>' : '') + '</form>';
  }

  function renderStart() {
    S.current = -1;
    view.innerHTML = '<section class="col start" aria-labelledby="hi">' + glyph(false) +
      '<h1 id="hi"><span class="start__hi">Habari, Wanjiku.</span><br><span class="start__ask">Ask about Kenya’s <em>mobile money</em>.</span></h1>' +
      composer('start') +
      '<p class="caps start__cap">Start with a question</p><div class="examples">' +
      EXAMPLES.map(function (e, k) { return '<button type="button" class="ex" data-ex="' + k + '"><span>' + esc(e.q) + '</span><span class="ex__tag caps">' + icon(e.ic) + e.tag + '</span></button>'; }).join('') +
      '</div></section><p class="foot">Every answer comes only from the CBK Mobile Payments table, with its steps and source. A personal concept, not CBK work; answers are worked out by fixed rules.</p>';
    dock.hidden = true;
    playGlyph($('.glyph', view), false);
    renderDataset(); renderRecent();
  }

  function ensureThread() {
    if (!$('.thread', view)) {
      view.innerHTML = '<div class="col thread" id="thread" aria-live="polite"></div>';
      dock.innerHTML = '<div class="col">' + composer('follow') + '</div>';
      dock.hidden = false;
    }
    return $('#thread');
  }

  function ask(question, build, source) {
    if (S.busy) return;
    var a;
    try { a = build ? build() : route(question); } catch (e) { a = cant('unknown'); if (window.console) console.error(e); }
    S.busy = true;
    track('question_asked', { source: source || 'typed', steps_on: S.steps });
    var thread = ensureThread();
    var turnIx = S.turns.length;
    var turn = document.createElement('section');
    turn.className = 'turn';
    turn.setAttribute('aria-label', 'Question ' + (turnIx + 1));
    turn.innerHTML = '<p class="q">' + esc(question) + '</p><div class="card" aria-busy="true">' +
      '<p class="working">' + glyph(true) + 'Working it out</p><ol class="wsteps">' +
      a.work.map(function (w) { return '<li class="wstep wstep--pending"><span class="wstep__i"></span><span>' + esc(w) + '</span></li>'; }).join('') +
      '</ol>' + (a.kind === 'cant' || a.kind === 'help' ? '' : '<div class="ph" aria-hidden="true"><i></i><i></i><i></i><i></i></div>') +
      sourceRow(false) + '</div>';
    thread.appendChild(turn);
    S.turns.push({ q: question, a: a, el: turn, rating: 0, open: a.stepsOpen === true || S.steps });
    S.today.push({ label: a.recent, turn: turnIx, thread: S.thread, q: question, run: build });
    S.current = turnIx;
    if (S.dsOpen === null) renderDataset();
    renderRecent();
    turn.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' });
    var stop = playGlyph($('.glyph', turn), true);
    var lis = $$('.wstep', turn), t0 = performance.now(), k = 0, per = REDUCED ? 60 : 380;
    (function next() {
      if (k > 0) { lis[k - 1].className = 'wstep wstep--done'; lis[k - 1].firstChild.innerHTML = icon('check'); }
      if (k < lis.length) { lis[k].className = 'wstep wstep--active'; k++; setTimeout(next, per + (k === 4 ? 220 : 0)); return; }
      stop();
      renderAnswer(turnIx);
      S.busy = false;
      track('answer_shown', { status: a.status, has_flag: !!a.evt.has_flag, chart: a.evt.chart, ms: Math.round(performance.now() - t0) });
      if (S.turns[turnIx].open && hasSteps(a)) track('steps_opened', { status: a.status, by_default: true });
      var fi = $('#q-follow'); if (fi && source === 'typed') fi.focus();
    })();
  }
  function hasSteps(a) { return a.steps && a.steps.length; }

  function sourceRow(live) {
    return '<p class="source">' + icon('source') + '<span>Central Bank of Kenya · Mobile Payments table · retrieved ' + D.retrieved + '</span>' +
      (live ? '<button type="button" class="linkbtn" data-table>Open table</button>' : '<span class="linkbtn" aria-hidden="true">Open table</span>') + '</p>';
  }

  function renderAnswer(ix) {
    var T = S.turns[ix], a = T.a, card = $('.card', T.el);
    var chip = a.status === 'answered' ? '<span class="chip chip--answered">Answered</span>' : a.status === 'partly' ? '<span class="chip chip--partly">Partly answered</span>' : '<span class="chip chip--cant">Can’t answer from this data</span>';
    if (a.kind === 'help') chip = '<span class="chip chip--cant">Help</span>';
    var h = '<p class="status">' + chip + (a.flags ? '<span class="flag">' + icon('flagS') + a.flags + ' data flag' + (a.flags > 1 ? 's' : '') + '</span>' : '') + (a.meta ? '<span>' + esc(a.meta) + '</span>' : '') + '</p>' +
      '<div class="a__text"><h2 class="a__title">' + esc(a.title) + '</h2><p class="a__sub">' + esc(a.sub) + '</p></div>';
    if (a.tiles) {
      h += '<p class="caps">What I can tell you instead</p><div class="tiles">' + a.tiles.map(function (t) { return '<div class="tile"><b>' + esc(t.v) + '</b><span>' + esc(t.l) + '</span></div>'; }).join('') + '</div>' +
        '<div><button type="button" class="btn btn--primary" data-cta>' + esc(a.cta.label) + '</button></div>';
    }
    if (a.helpList) h += '<ul class="helplist">' + a.helpList.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    if (a.cols) h += '<p class="caps">Columns in this table</p><div class="cols">' + a.cols.map(function (c) { return '<span class="chip chip--col">' + esc(c) + '</span>'; }).join('') + '</div>';
    if (a.noteCant) h += '<div class="note">' + icon('info') + '<p>' + esc(a.noteCant) + '</p></div>';
    if (a.chart) h += '<div class="chart" data-chart></div>';
    if (a.note && a.kind === 'partly') h += note(a.note);
    if (hasSteps(a)) {
      h += '<div class="divider"></div><button type="button" class="toggle-steps" data-toggle-steps aria-expanded="' + T.open + '" aria-controls="steps-' + ix + '">' + icon('chevronDown') + '<b>How I got this</b><span>· ' + a.steps.length + ' step' + (a.steps.length > 1 ? 's' : '') + '</span></button>' +
        '<div class="steps" id="steps-' + ix + '"' + (T.open ? '' : ' hidden') + '><ol class="steplist">' + a.steps.map(function (s, k) { return '<li><b>' + (k + 1) + '</b><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>' +
        (a.sql ? '<pre class="query" aria-label="The query Hesabu ran">' + esc(a.sql) + '</pre>' : '') + '</div>';
    }
    if (a.note && a.kind !== 'partly') h += note(a.note);
    if (a.rows) h += (hasSteps(a) ? '' : '<div class="divider"></div>') + sourceRow(true);
    h += '<div class="divider"></div><div class="a__foot">' +
      a.follow.map(function (f, k) { return '<button type="button" class="btn" data-follow="' + k + '">' + esc(f.toggle ? (T.open ? 'Hide the steps' : 'Show the steps') : f.label) + '</button>'; }).join('') +
      '<span class="grow"></span><span class="fb" role="group" aria-label="Was this helpful?"><button type="button" data-rate="1" aria-pressed="' + (T.rating === 1) + '" aria-label="Helpful">' + icon('thumb') + '</button><button type="button" data-rate="-1" aria-pressed="' + (T.rating === -1) + '" aria-label="Not helpful">' + icon('thumb') + '</button></span></div>';
    card.innerHTML = h;
    card.removeAttribute('aria-busy');
    card.setAttribute('data-ix', ix);
    if (a.chart) drawChart($('[data-chart]', card), a.chart);
  }
  function note(n) {
    var ic = n.kind === 'warn' ? 'bulbD' : n.kind === 'flag' ? 'flag' : 'info';
    return '<div class="note note--' + n.kind + '">' + icon(ic) + '<div>' + (n.title ? '<p class="note__title">' + esc(n.title) + '</p>' : '') + '<p>' + esc(n.text) + '</p></div></div>';
  }

  /* ---------- Open table ---------- */
  function openTable(ix) {
    var a = S.turns[ix].a, r = a.rows, keys = r.keys;
    var rows = range(r.a, r.b).reverse();
    var html = '<div class="drawer" role="dialog" aria-modal="true" aria-labelledby="dt-title"><div class="drawer__head"><div><h2 id="dt-title">CBK Mobile Payments · ' + rows.length + ' rows</h2>' +
      '<p>The rows this answer used, as Central Bank of Kenya published them. Highlighted cells are the ones quoted' + (r.flagged.length ? '; flagged months are shaded' : '') + '.</p></div>' +
      '<button type="button" class="drawer__close" data-close aria-label="Close">×</button></div><div class="drawer__body"><table class="dtable"><thead><tr><th scope="col">Month</th>' +
      keys.map(function (k) { return '<th scope="col">' + M[k].label + (k === 'value' ? ' (KSh bn)' : k === 'volume' || k === 'accounts' ? ' (M)' : '') + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (i) {
      html += '<tr' + (r.flagged.indexOf(i) > -1 ? ' class="is-flag"' : '') + '><td>' + mMid(i) + '</td>' + keys.map(function (k) {
        var v = M[k].get(i);
        return '<td' + (r.hit.indexOf(i) > -1 ? ' class="hit"' : '') + '>' + (k === 'agents' ? int(v) : String(v)) + '</td>';
      }).join('') + '</tr>';
    });
    html += '</tbody></table></div><div class="drawer__foot"><a href="' + D.source + '" target="_blank" rel="noopener">See the table on centralbank.go.ke ↗</a><span class="ds__org">Copied ' + D.retrieved + '</span></div></div>';
    var wrap = $('#drawer');
    wrap.innerHTML = html; wrap.hidden = false;
    $('[data-close]', wrap).focus();
    wrap.dataset.from = ix;
    track('source_opened', { status: a.status });
  }
  function closeTable() {
    var wrap = $('#drawer'); if (wrap.hidden) return;
    wrap.hidden = true;
    var T = S.turns[+wrap.dataset.from]; var btn = T && $('[data-table]', T.el); if (btn) btn.focus();
  }

  /* ---------- Event plan view ---------- */
  function renderPlan() {
    var el = $('#plan');
    var html = '<div class="plan__head"><span class="logo"><span class="logo__mark">' + MARK + '</span><span class="logo__word">Hesabu</span></span><span class="chip chip--plan">Event plan · PostHog</span></div>' +
      '<h1 id="plan-title">What Hesabu tracks, and why</h1>' +
      '<p class="plan__lede">The goal isn’t more questions. It’s answers people trust enough to use, and refusals that still lead somewhere. Seven events cover that. The counts below are live for this visit: use the app, then come back.</p>' +
      '<div class="plan__body"><div class="ev"><table><thead><tr><th class="caps" scope="col">Event</th><th class="caps" scope="col">Fires when</th><th class="caps" scope="col">Properties</th><th class="caps" scope="col">Why it matters</th></tr></thead><tbody>';
    EVENTS.forEach(function (e) {
      var c = counts[e[0]] || 0;
      html += '<tr><td><span class="ev__name">' + e[0] + '</span><span class="ev__count' + (c ? ' is-live' : '') + '">' + (c ? 'Fired ' + c + '× this visit' : 'Not fired yet') + '</span></td><td>' + esc(e[1]) + '</td><td><span class="ev__props">' +
        e[2].map(function (p) { var v = lastProps[e[0]] && lastProps[e[0]][p]; return '<span class="chip chip--prop" title="' + (v !== undefined ? esc(p + ': ' + v) : '') + '">' + p + '</span>'; }).join('') + '</span></td><td>' + esc(e[3]) + '</td></tr>';
    });
    var asked = counts.question_asked || 0, shown = counts.answer_shown || 0;
    html += '</tbody></table></div><div><p class="caps">Four measures</p><div class="measures">' +
      measure('chart', 'Answer rate', 'Answers with status “answered” ÷ questions asked') +
      measure('bulb', 'Refusal recovery', '“Can’t answer” followed by an alternative ÷ all “can’t answer”') +
      measure('search', 'Check rate', 'Answers where steps or the source were opened ÷ answers shown') +
      measure('thumbS', 'Helpful, by status', 'Thumbs up ÷ all ratings, for each answer status') +
      '<div class="measure measure--note">' + icon('warning') + '<span>No question text is stored, only its type, so the plan never records what a person typed.</span></div></div></div></div>' +
      '<div class="path"><p class="caps">The path we want</p><div class="path__row">' +
      pathStep('Someone asks', 'question_asked') + icon('chevronRight') + pathStep('Hesabu answers, or says it can’t', 'answer_shown') + icon('chevronRight') +
      pathStep('They check the working', 'steps_opened · source_opened', true) + icon('chevronRight') + pathStep('They keep going', 'followup_clicked · refusal_next_step') + '</div></div>' +
      '<p class="plan__lede" style="margin-top:20px">' + (asked ? 'This visit so far: ' + asked + ' question' + (asked > 1 ? 's' : '') + ' asked, ' + shown + ' answer' + (shown === 1 ? '' : 's') + ' shown.' : 'Nothing tracked yet this visit.') + ' Events are logged to the browser console only; nothing is sent anywhere.</p>';
    el.innerHTML = html;
  }
  function measure(ic, t, d) { return '<div class="measure"><b>' + icon(ic) + t + '</b><span>' + esc(d) + '</span></div>'; }
  function pathStep(t, c, key) { return '<div class="path__step' + (key ? ' path__step--key' : '') + '"><b>' + esc(t) + '</b><code>' + esc(c) + '</code></div>'; }

  function setView(v) {
    S.view = v;
    $$('.concept__view button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === v)); });
    var plan = v === 'plan';
    $('#plan').hidden = !plan; $('#main').hidden = plan; $('#side').hidden = plan;
    if (plan) renderPlan(); else redrawCharts();
  }

  /* ---------- Toast and share ---------- */
  var toastT;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2200); }
  function share() {
    var T = S.turns[S.current];
    var url = location.origin + location.pathname + (T ? '?ask=' + encodeURIComponent(T.q) : '');
    var done = function () { toast(T ? 'Link to this question copied' : 'Link copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { toast('Copy the link from the address bar'); });
    else toast('Copy the link from the address bar');
  }

  /* ---------- Events from the page ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a'); if (!t) { if (e.target.id === 'drawer') closeTable(); return; }
    if (t.matches('[data-view]')) return setView(t.dataset.view);
    if (t.matches('[data-reset]')) { counts = {}; lastProps = {}; S = fresh(); history.replaceState(null, '', location.pathname); setView('app'); renderStart(); return; }
    if (t.matches('[data-new]')) { if (S.busy) return; S.turns = []; S.thread++; S.dsOpen = null; renderStart(); return; }
    if (t.matches('[data-share]')) return share();
    if (t.matches('[data-ds]')) { var open = t.getAttribute('aria-expanded') === 'true'; S.dsOpen = !open; renderDataset(); $('[data-ds]').focus(); return; }
    if (t.matches('[data-ex]')) { var ex = EXAMPLES[+t.dataset.ex]; return ask(ex.q, null, 'suggestion'); }
    if (t.matches('[data-yday]')) { var y = YESTERDAY[+t.dataset.yday]; return ask(y.q, y.run, 'history'); }
    if (t.matches('[data-today]')) {
      var it = S.today[+t.dataset.today];
      if (it.thread === S.thread && S.turns[it.turn]) { S.current = it.turn; renderRecent(); S.turns[it.turn].el.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' }); return; }
      return ask(it.q, it.run, 'history');
    }
    if (t.matches('[data-steps-switch]')) { S.steps = t.getAttribute('aria-checked') !== 'true'; $$('[data-steps-switch]').forEach(function (s) { s.setAttribute('aria-checked', String(S.steps)); }); return; }
    if (t.matches('[data-close]')) return closeTable();
    var card = t.closest('.card[data-ix]'); if (!card) return;
    var ix = +card.dataset.ix, T = S.turns[ix];
    if (t.matches('[data-toggle-steps]')) { T.open = !T.open; renderAnswer(ix); $('[data-toggle-steps]', card).focus(); if (T.open) track('steps_opened', { status: T.a.status, by_default: false }); return; }
    if (t.matches('[data-table]')) return openTable(ix);
    if (t.matches('[data-rate]')) { var r = +t.dataset.rate; T.rating = T.rating === r ? 0 : r; renderAnswer(ix); $('[data-rate="' + r + '"]', card).focus(); if (T.rating) track('answer_rated', { rating: r > 0 ? 'up' : 'down', status: T.a.status }); return; }
    if (t.matches('[data-cta]')) { track('refusal_next_step', { alternative: 'trend' }); return ask(T.a.cta.label, T.a.cta.run, 'followup'); }
    if (t.matches('[data-follow]')) {
      var f = T.a.follow[+t.dataset.follow];
      if (f.toggle) { T.open = !T.open; renderAnswer(ix); if (T.open) track('steps_opened', { status: T.a.status, by_default: false }); return; }
      track('followup_clicked', { from_status: T.a.status, followup: f.label });
      if (T.a.status === 'cant') track('refusal_next_step', { alternative: 'help' });
      return ask(f.label, f.run, 'followup');
    }
  });
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-ask]'); if (!form) return;
    e.preventDefault();
    var ta = $('textarea', form), q = ta.value.trim();
    var hint = $('.composer__hint', form);
    if (!q) { if (!hint) { hint = document.createElement('p'); hint.className = 'composer__hint'; hint.setAttribute('role', 'alert'); form.appendChild(hint); } hint.textContent = 'Type a question first, or pick one below.'; ta.focus(); return; }
    if (hint) hint.remove();
    ta.value = '';
    ask(q, null, 'typed');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeTable();
    if (e.key === 'Enter' && !e.shiftKey && e.target.matches('.composer textarea')) { e.preventDefault(); e.target.form.requestSubmit ? e.target.form.requestSubmit() : e.target.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }
  });
  document.addEventListener('input', function (e) {
    if (!e.target.matches('.composer--start textarea')) return;
    e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  });

  function redrawCharts() { S.turns.forEach(function (T) { var c = $('[data-chart]', T.el); if (c && T.a.chart) drawChart(c, T.a.chart); }); }
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(redrawCharts, 120); });

  /* ---------- Start ---------- */
  S = fresh();
  renderChrome();
  renderStart();
  var deep = new URLSearchParams(location.search).get('ask');
  if (deep) setTimeout(function () { ask(deep.slice(0, 240), null, 'link'); }, 200);

  // for checking answers from the console: Hesabu.route('…')
  window.Hesabu = { route: route, data: D };
})();
