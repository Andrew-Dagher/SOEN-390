/**
 * @file SettingsInactive.jsx
 * @description Renders an inactive settings icon using an SVG element.
 * The icon consists of two paths: one for the gear (or knob) shape and another for the inner details,
 * both filled with a specified color.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * SettingsInactive component renders an SVG icon representing an inactive settings state.
 *
 * @component
 * @returns {JSX.Element} The rendered inactive settings icon.
 */
const SettingsInactive = () => (
  <Svg
    width={30}
    height={30}
    viewBox="0 0 34 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer gear shape */}
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17 11.75C13.5482 11.75 10.75 14.5482 10.75 18C10.75 21.4518 13.5482 24.25 17 24.25C20.4518 24.25 23.25 21.4518 23.25 18C23.25 14.5482 20.4518 11.75 17 11.75ZM13.25 18C13.25 15.929 14.929 14.25 17 14.25C19.071 14.25 20.75 15.929 20.75 18C20.75 20.071 19.071 21.75 17 21.75C14.929 21.75 13.25 20.071 13.25 18Z"
      fill="#862532"
      strokeWidth={2}
    />
    {/* Inner gear details */}
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.9579 0.0832527C16.2172 0.083236 15.5987 0.0832359 15.0911 0.117869C14.5626 0.153936 14.0634 0.231669 13.5794 0.432136C12.4564 0.897319 11.5641 1.78957 11.099 2.91262C10.8568 3.49729 10.7912 4.11345 10.7661 4.78319C10.746 5.32157 10.4743 5.77077 10.0733 6.00227C9.67237 6.23377 9.1475 6.24447 8.67118 5.99272C8.07865 5.67954 7.51223 5.42824 6.8848 5.34564C5.67963 5.18697 4.46078 5.51357 3.4964 6.25357C3.0808 6.57247 2.76387 6.96592 2.4684 7.40559C2.18455 7.82794 1.87537 8.3635 1.50498 9.00504L1.4629 9.07794C1.0925 9.71945 0.7833 10.255 0.55945 10.712C0.326434 11.1877 0.14415 11.6589 0.0757669 12.1783C-0.0828997 13.3835 0.2437 14.6023 0.983684 15.5668C1.36888 16.0686 1.86963 16.4336 2.43703 16.7901C2.89333 17.0768 3.14655 17.5368 3.14652 17.9999C3.1465 18.4629 2.89328 18.9229 2.43703 19.2096C1.86957 19.5661 1.36877 19.9311 0.983534 20.4331C0.243534 21.3974 -0.0830498 22.6163 0.0756002 23.8214C0.143984 24.3408 0.326267 24.8121 0.559284 25.2878C0.783134 25.7448 1.09233 26.2803 1.46272 26.9218L1.50482 26.9948C1.8752 27.6363 2.18438 28.1718 2.46823 28.5941C2.7637 29.0338 3.08063 29.4273 3.49623 29.7461C4.46062 30.4861 5.67947 30.8128 6.88463 30.6541C7.51203 30.5714 8.07842 30.3203 8.67092 30.0071C9.1473 29.7553 9.67223 29.7659 10.0733 29.9976C10.4743 30.2291 10.746 30.6783 10.7661 31.2168C10.7912 31.8864 10.8568 32.5026 11.099 33.0873C11.5641 34.2103 12.4564 35.1026 13.5794 35.5678C14.0634 35.7683 14.5626 35.8459 15.0911 35.8819C15.5987 35.9166 16.2172 35.9166 16.9579 35.9166H17.0421C17.7829 35.9166 18.4012 35.9166 18.9091 35.8819C19.4376 35.8459 19.9367 35.7683 20.4207 35.5678C21.5437 35.1026 22.4361 34.2103 22.9012 33.0873C23.1434 32.5026 23.2089 31.8864 23.2339 31.2166C23.2541 30.6783 23.5257 30.2291 23.9268 29.9974C24.3277 29.7659 24.8527 29.7553 25.3291 30.0069C25.9216 30.3201 26.4879 30.5714 27.1154 30.6539C28.3206 30.8126 29.5394 30.4861 30.5037 29.7461C30.9194 29.4271 31.2362 29.0338 31.5317 28.5941C31.8156 28.1718 32.1248 27.6363 32.4951 26.9948L32.5373 26.9218C32.9076 26.2803 33.2169 25.7446 33.4408 25.2876C33.6738 24.8119 33.8559 24.3408 33.9244 23.8214C34.0831 22.6161 33.7564 21.3973 33.0164 20.4329C32.6313 19.9309 32.1304 19.5661 31.5631 19.2096C31.1068 18.9229 30.8536 18.4629 30.8536 17.9998C30.8536 17.5368 31.1068 17.0769 31.5629 16.7903C32.1306 16.4338 32.6314 16.0689 33.0166 15.5668C33.7566 14.6024 34.0832 13.3836 33.9246 12.1784C33.8561 11.659 33.6739 11.1878 33.4409 10.7121C33.2171 10.2551 32.9079 9.71964 32.5374 9.07817L32.4954 9.00522C32.1249 8.36367 31.8158 7.82805 31.5319 7.4057C31.2364 6.96604 30.9196 6.57259 30.5039 6.25367C29.5396 5.51369 28.3208 5.18709 27.1154 5.34575C26.4881 5.42835 25.9217 5.67962 25.3292 5.99279C24.8527 6.24457 24.3277 6.23385 23.9269 6.00232C23.5259 5.7708 23.2541 5.32154 23.2339 4.7831C23.2089 4.11339 23.1434 3.49725 22.9012 2.91262C22.4361 1.78957 21.5437 0.897319 20.4207 0.432136C19.9367 0.231669 19.4376 0.153936 18.9091 0.117869C18.4012 0.0832359 17.7829 0.083236 17.0421 0.0832527H16.9579ZM14.5361 2.74184C14.6647 2.68857 14.8601 2.63945 15.2612 2.61207C15.6737 2.58394 16.2064 2.58325 17.0001 2.58325C17.7937 2.58325 18.3264 2.58394 18.7387 2.61207C19.1401 2.63945 19.3354 2.68857 19.4639 2.74184C19.9744 2.95329 20.3801 3.35885 20.5914 3.86934C20.6582 4.03035 20.7134 4.28137 20.7357 4.87654C20.7851 6.19717 21.4667 7.46874 22.6769 8.16739C23.8869 8.86605 25.3291 8.82059 26.4974 8.20305C27.0239 7.92475 27.2691 7.84712 27.4417 7.82437C27.9896 7.75225 28.5436 7.9007 28.9819 8.23705C29.0924 8.32179 29.2326 8.4664 29.4569 8.80019C29.6876 9.1433 29.9544 9.60425 30.3513 10.2916C30.7481 10.9789 31.0139 11.4406 31.1958 11.8118C31.3726 12.173 31.4277 12.3667 31.4459 12.5047C31.5181 13.0525 31.3696 13.6065 31.0333 14.0449C30.9271 14.1832 30.7374 14.3566 30.2329 14.6734C29.1141 15.3766 28.3538 16.6026 28.3536 17.9998C28.3536 19.3971 29.1139 20.6233 30.2329 21.3264C30.7372 21.6433 30.9269 21.8166 31.0331 21.9549C31.3694 22.3933 31.5179 22.9473 31.4458 23.4951C31.4276 23.6331 31.3724 23.8268 31.1956 24.1879C31.0138 24.5591 30.7479 25.0208 30.3511 25.7081C29.9542 26.3954 29.6874 26.8564 29.4568 27.1996C29.2324 27.5333 29.0922 27.6779 28.9817 27.7626C28.5434 28.0991 27.9894 28.2474 27.4416 28.1754C27.2689 28.1526 27.0237 28.0749 26.4972 27.7968C25.3289 27.1791 23.8867 27.1338 22.6766 27.8324C21.4667 28.5311 20.7851 29.8026 20.7357 31.1233C20.7134 31.7184 20.6582 31.9694 20.5914 32.1306C20.3801 32.6409 19.9744 33.0466 19.4639 33.2581C19.3354 33.3113 19.1401 33.3604 18.7387 33.3878C18.3264 33.4159 17.7937 33.4166 17.0001 33.4166C16.2064 33.4166 15.6737 33.4159 15.2612 33.3878C14.8601 33.3604 14.6647 33.3113 14.5361 33.2581C14.0257 33.0466 13.6201 32.6409 13.4087 32.1306C13.342 31.9694 13.2867 31.7184 13.2644 31.1233C13.215 29.8028 12.5334 28.5311 11.3232 27.8324C10.1131 27.1338 8.67112 27.1793 7.50272 27.7968C6.97617 28.0751 6.73113 28.1528 6.55833 28.1754C6.01052 28.2476 5.4565 28.0991 5.01815 27.7628C4.90772 27.6781 4.7675 27.5334 4.54318 27.1996C4.3126 26.8566 4.04568 26.3956 3.64885 25.7083C3.252 25.0209 2.98627 24.5593 2.80442 24.1881C2.62752 23.8269 2.57238 23.6331 2.55422 23.4951C2.4821 22.9473 2.63055 22.3933 2.96692 21.9549C3.07302 21.8168 3.26277 21.6433 3.76708 21.3264C4.88605 20.6234 5.64645 19.3973 5.64652 18.0001C5.6466 16.6026 4.88617 15.3764 3.7671 14.6733C3.2629 14.3564 3.07317 14.183 2.96707 14.0448C2.63072 13.6064 2.48227 13.0524 2.55438 12.5046C2.57255 12.3666 2.62768 12.1728 2.80458 11.8117C2.98643 11.4404 3.25217 10.9788 3.649 10.2915C4.04585 9.60414 4.31275 9.14319 4.54335 8.80007C4.76767 8.4663 4.90788 8.32167 5.0183 8.23695C5.45667 7.90059 6.01068 7.75214 6.55848 7.82425C6.7313 7.847 6.97635 7.92464 7.50297 8.20299C8.6713 8.8205 10.1133 8.86595 11.3233 8.16734C12.5334 7.46872 13.215 6.1972 13.2644 4.87662C13.2867 4.2814 13.342 4.03037 13.4087 3.86934C13.6201 3.35885 14.0257 2.95329 14.5361 2.74184Z"
      fill="#862532"
      strokeWidth={2}
    />
  </Svg>
);

export default SettingsInactive;
