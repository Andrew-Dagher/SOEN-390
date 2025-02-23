/**
 * @file Concordia50.jsx
 * @description Renders the Concordia50 icon as an SVG element. This component displays a custom
 * Concordia logo that can be resized via props. The icon is defined using multiple SVG paths.
 */

import React from "react";
import { Svg, Path } from "react-native-svg";

/**
 * Concordia50 component renders an SVG-based Concordia logo.
 *
 * @param {Object} props - Component properties.
 * @param {number} [props.width=82] - The width of the SVG element.
 * @param {number} [props.height=87] - The height of the SVG element.
 * @returns {JSX.Element} The rendered SVG Concordia50 icon.
 */
const Concordia50 = (props) => (
  <Svg
    width={props.width || 82}
    height={props.height || 87}
    viewBox="0 0 82 87"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 
      The following Path element draws the Concordia50 logo.
      The complex d attribute defines the shape of the logo.
    */}
    <Path
      d="M43.8266 86.512H43.9112L43.883 86.569H45.8424L59.2061 60.0661H59.1215L59.1427 60.0305H57.1832L43.8337 86.5191L43.8266 86.512ZM54.7375 60.3012C54.6952 60.3297 54.6529 60.3582 54.6106 60.3867L54.674 60.2656C51.312 62.695 47.1957 64.127 42.7482 64.127C38.0329 64.127 33.7052 62.5026 30.2304 59.8096C25.367 56.0052 22.2234 50.0634 22.2234 43.3664C22.2234 31.8747 31.4356 22.5631 42.8046 22.5631C44.7006 22.5631 46.5402 22.8267 48.2882 23.3111C51.2203 24.1376 53.8917 25.6123 56.1401 27.5644L56.1542 27.5359C56.1542 27.5359 56.1894 27.5644 56.2106 27.5787L58.6352 22.7768L59.0933 21.872C55.5974 19.1576 51.5305 17.3765 47.1957 16.6569C45.7438 16.4147 44.2636 16.2865 42.7623 16.2865C35.6153 16.2865 28.8982 19.1006 23.8445 24.2088C18.7909 29.317 16.0068 36.1066 16.0068 43.3308C16.0068 50.555 18.7909 57.3446 23.8445 62.4528C24.4789 63.094 25.1414 63.6995 25.8322 64.2695C30.611 68.2521 36.5527 70.4179 42.8258 70.4179C45.3491 70.4179 47.816 70.0617 50.1842 69.3848L50.8045 68.1523C50.8045 68.1523 50.741 68.1737 50.7058 68.1808C50.741 68.1737 50.7692 68.1594 50.8045 68.1523L54.7657 60.3012H54.7375ZM41.9799 34.6105C40.5632 34.6105 39.1818 34.8527 37.8567 35.3229L38.3078 32.3093H48.4997V29.1603H48.4362V29.1389H35.4743L33.7475 41.3217L33.8109 41.2718L33.7968 41.3502L34.8823 40.4668C35.425 40.0251 36.151 39.5691 37.0391 39.1203C38.78 38.2368 40.4575 37.788 42.0363 37.788C43.2416 37.788 44.3693 37.9946 45.4125 38.4078C46.4486 38.8282 47.3931 39.4409 48.2459 40.2673C49.9939 41.9415 50.8468 43.9007 50.8468 46.2589C50.8468 48.6171 49.9939 50.5835 48.2459 52.2577C46.5261 53.9177 44.4187 54.7584 41.9799 54.7584C40.3236 54.7584 38.8082 54.3594 37.4549 53.5686C37.0179 53.305 36.588 53.0058 36.1862 52.6638C34.5298 51.2532 33.5501 49.4863 33.2752 47.4131L33.2118 46.9286H33.1625V46.9001H29.9273L29.9978 47.52C30.322 50.4481 31.64 52.9274 33.9166 54.908C34.4876 55.4067 35.0796 55.8484 35.7069 56.226C37.5888 57.373 39.7104 57.9573 42.0363 57.9573C45.3561 57.9573 48.2248 56.8102 50.5648 54.5589C52.9119 52.2862 54.1031 49.5077 54.1031 46.3088C54.1031 43.1099 52.9119 40.3385 50.5648 38.0801C49.3807 36.9331 48.0627 36.071 46.6178 35.501C45.187 34.924 43.6363 34.639 41.9799 34.639M46.0821 77.4711C46.0821 77.4711 46.0257 77.4711 45.9975 77.4711L46.0257 77.4141C44.9473 77.5209 43.8548 77.5779 42.7482 77.5779C33.4021 77.5779 24.9441 73.7521 18.812 67.5752C12.687 61.377 8.89501 52.8134 8.89501 43.3522C8.89501 24.4226 24.0772 9.07653 42.8046 9.07653C43.7068 9.07653 44.609 9.11215 45.4971 9.18339C51.7208 9.68923 57.4793 11.8978 62.3003 15.3389L62.3144 15.3104C62.3144 15.3104 62.3497 15.3318 62.3708 15.346L62.8219 14.4483C57.7189 10.822 51.7772 8.66331 45.49 8.18597C44.5808 8.11473 43.6715 8.07911 42.7482 8.07911C33.4373 8.07911 24.6763 11.7482 18.0931 18.4024C11.5029 25.0566 7.88005 33.9123 7.88005 43.3237C7.88005 52.735 11.51 61.5907 18.0931 68.2449L18.1072 68.2592C18.1143 68.2663 18.1213 68.2734 18.1283 68.2877C24.7186 74.949 33.4797 78.6181 42.8046 78.6181C43.7279 78.6181 44.6442 78.5754 45.5605 78.5041L46.0891 77.4568L46.0821 77.4711ZM60.503 19.0507L60.9541 18.1459C57.007 15.232 52.4679 13.3298 47.6398 12.5604C46.0327 12.3039 44.3975 12.1685 42.7412 12.1685C34.5087 12.1685 26.7696 15.4101 20.9406 21.2949C15.1187 27.1797 11.9117 35.0023 11.9117 43.3308C11.9117 51.6593 15.1187 59.4819 20.9406 65.3595C21.3071 65.73 21.6878 66.0933 22.0684 66.4424C27.7564 71.6718 35.0585 74.5287 42.7976 74.5287C44.4751 74.5287 46.1314 74.3933 47.7596 74.1297L48.3164 73.0183C48.3164 73.0183 48.253 73.0183 48.2248 73.0325L48.253 72.9755C46.4627 73.3104 44.6231 73.4885 42.7341 73.4885C35.0232 73.4885 27.989 70.5319 22.6957 65.673C16.6975 60.1516 12.9337 52.1936 12.9337 43.3522C12.9337 26.681 26.3044 13.1659 42.7976 13.1659C44.4398 13.1659 46.0468 13.3013 47.6116 13.5578C52.3551 14.3486 56.718 16.2651 60.4255 19.0294L60.4396 19.0009C60.4396 19.0009 60.4748 19.0222 60.4959 19.0365M15.3865 71.0733C22.7098 78.4756 32.4435 82.5508 42.8046 82.5508C43.0443 82.5508 43.291 82.5437 43.5306 82.5365L44.0381 81.532C44.0381 81.532 43.9817 81.532 43.9535 81.532L43.9817 81.4821C43.5729 81.4964 43.1641 81.5035 42.7482 81.5035C31.6823 81.5035 21.7301 76.6945 14.8227 69.0286C8.72585 62.2462 5.01139 53.2409 5.01139 43.3593C5.01139 22.2638 21.9274 5.16521 42.7976 0.99742C51.3754 0.99742 59.333 3.61209 65.9584 8.07198L65.9725 8.04348C65.9725 8.04348 66.0148 8.06486 66.0289 8.07911M78.6173 42.9746C78.6173 46.1948 77.6164 48.9805 75.6358 51.246C73.6482 53.5259 71.3293 54.6373 68.5381 54.6373C67.1566 54.6373 65.895 54.3665 64.725 53.8108C63.562 53.248 62.4906 52.4073 61.5039 51.2745C59.5374 49.0018 58.5365 46.2162 58.5365 42.9959C58.5365 39.7757 59.5374 36.99 61.5039 34.7174C63.4915 32.4375 65.8175 31.3261 68.6086 31.3261C69.2993 31.3261 69.9689 31.3974 70.6033 31.5327C72.4993 31.9602 74.1556 33.0075 75.6287 34.696C77.6093 36.9687 78.6102 39.7543 78.6102 42.9674M81.9018 43.0031C81.9018 38.9493 80.5978 35.4298 78.0252 32.5587C76.0869 30.3715 73.8103 28.9964 71.2447 28.455C70.3777 28.2626 69.4755 28.1629 68.5381 28.1629C66.7478 28.1629 64.9999 28.5618 63.3576 29.3455C61.7647 30.0936 60.3479 31.1694 59.1356 32.5373C56.563 35.4084 55.259 38.9279 55.259 42.9817C55.259 47.0355 56.563 50.5478 59.1356 53.4261C60.4325 54.8795 61.8774 55.9767 63.4492 56.7105C65.0351 57.4585 66.7549 57.8361 68.6086 57.8361C70.4623 57.8361 72.1469 57.4372 73.7962 56.6535C75.3821 55.9054 76.8058 54.8296 78.0182 53.4617C80.5908 50.5835 81.9018 47.0711 81.9018 43.0102"
      fill="white"
      fillOpacity="0.32"
    />
  </Svg>
);

export default Concordia50;
